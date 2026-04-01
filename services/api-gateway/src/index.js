import crypto from "node:crypto";

import express from "express";
import jwt from "jsonwebtoken";
import {
  createCorrelationIdMiddleware,
  createJsonLogger,
  createRequestCompletionLogger
} from "../../shared/observability.js";
import {
  gatewayAuthLogFields,
  isGatewayAuthPath
} from "./observabilityConfig.js";
import {
  buildRouteTable,
  compileRoutes,
  interpolatePath,
  matchRoute
} from "./routing.js";

const config = {
  serviceName: "api-gateway",
  port: Number(process.env.PORT || 4000),
  identityServiceUrl: process.env.IDENTITY_SERVICE_URL || "http://127.0.0.1:4001",
  eventManagementServiceUrl:
    process.env.EVENT_MANAGEMENT_SERVICE_URL || "http://127.0.0.1:4002",
  registrationServiceUrl:
    process.env.REGISTRATION_SERVICE_URL || "http://127.0.0.1:4003",
  upstreamTimeoutMs: Number(process.env.UPSTREAM_TIMEOUT_MS || 4000)
};
const log = createJsonLogger(config.serviceName);

function resolveJwtSecret(envKey, fallbackValue) {
  const configured = String(process.env[envKey] || "").trim();
  if (configured) {
    if (configured.length < 32) {
      if (process.env.ALLOW_INSECURE_JWT_DEFAULTS === "true") {
        log("warn", "auth.jwt.secret.weak", {
          envKey,
          length: configured.length,
          message: "Weak secret allowed by ALLOW_INSECURE_JWT_DEFAULTS."
        });
        return configured;
      }
      throw new Error(`${envKey} must be at least 32 characters`);
    }
    return configured;
  }

  if (process.env.ALLOW_INSECURE_JWT_DEFAULTS === "true") {
    log("warn", "auth.jwt.secret.insecure_default", {
      envKey,
      message: "Using insecure default secret; set env to harden."
    });
    return fallbackValue;
  }

  throw new Error(`${envKey} is required (set env or allow insecure defaults)`);
}

config.jwtAccessSecret = resolveJwtSecret(
  "JWT_ACCESS_SECRET",
  "dev-insecure-access-secret"
);

const app = express();
app.use(express.json());

const corsOrigins = String(process.env.CORS_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.header("origin");
  if (origin && corsOrigins.includes(origin)) {
    res.setHeader("access-control-allow-origin", origin);
    res.setHeader("vary", "origin");
    res.setHeader("access-control-allow-credentials", "true");
  }
  res.setHeader(
    "access-control-allow-headers",
    "authorization, content-type, x-correlation-id"
  );
  res.setHeader(
    "access-control-allow-methods",
    "GET,POST,PATCH,PUT,DELETE,OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  return next();
});

const routeTable = [
  ...buildRouteTable(config),
  {
    method: "GET",
    path: "/api/organizer/ping",
    public: false,
    allowedRoles: ["ORGANIZER", "ADMIN"],
    localHandler: (req, res) =>
      res.status(200).json(
        success({
          message: "Organizer route reachable",
          userId: req.auth.userId,
          role: req.auth.role
        })
      )
  }
];

const compiledRoutes = compileRoutes(routeTable);

function success(data, meta) {
  if (meta) return { success: true, data, meta };
  return { success: true, data };
}

function error(errorMessage, code, details) {
  const payload = { success: false, error: errorMessage };
  if (code) payload.code = code;
  if (details) payload.details = details;
  return payload;
}

function getRoute(req) {
  return matchRoute(compiledRoutes, req.method, req.path);
}

function parseBearerToken(authorizationHeader) {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    config.upstreamTimeoutMs
  );
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function checkUpstreamReadiness(url) {
  const candidates = ["/ready", "/health"];

  for (const path of candidates) {
    try {
      const response = await fetchWithTimeout(new URL(path, url), {
        method: "GET"
      });
      if (response.ok) {
        return { ok: true, path };
      }
    } catch {
      // Try the next readiness endpoint.
    }
  }

  return { ok: false };
}

app.use(createCorrelationIdMiddleware());
app.use(
  createRequestCompletionLogger({
    log,
    eventName: "gateway.auth.request.completed",
    isObserved: isGatewayAuthPath,
    buildFields: gatewayAuthLogFields
  })
);

app.get("/health", (_req, res) => {
  res.status(200).json(
    success({
      status: "ok",
      service: config.serviceName
    })
  );
});

app.get("/ready", async (_req, res) => {
  const upstreamChecks = await Promise.all([
    checkUpstreamReadiness(config.identityServiceUrl),
    checkUpstreamReadiness(config.eventManagementServiceUrl),
    checkUpstreamReadiness(config.registrationServiceUrl)
  ]);

  const [identity, eventManagement, registration] = upstreamChecks;
  const allReady = upstreamChecks.every((result) => result.ok);

  if (!allReady) {
    return res.status(503).json(
      error("Service not ready", "UPSTREAM_UNAVAILABLE", {
        identity: identity.ok,
        eventManagement: eventManagement.ok,
        registration: registration.ok
      })
    );
  }

  return res.status(200).json(
    success({
      status: "ready",
      service: config.serviceName,
      upstreams: {
        identity: identity.path,
        eventManagement: eventManagement.path,
        registration: registration.path
      }
    })
  );
});

app.use((req, res, next) => {
  const matched = getRoute(req);
  if (!matched) {
    return res.status(404).json(error("Route not found", "NOT_FOUND"));
  }

  req.matchedRoute = matched.route;
  req.matchedRouteParams = matched.params;
  const route = req.matchedRoute;
  if (route.public) return next();

  const token = parseBearerToken(req.header("authorization"));
  if (!token) {
    return res.status(401).json(error("Unauthorized", "UNAUTHORIZED"));
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtAccessSecret);
  } catch {
    return res.status(401).json(error("Unauthorized", "INVALID_TOKEN"));
  }

  const authContext = {
    userId: payload.sub,
    email: payload.email || null,
    name: payload.name || null,
    role: payload.role,
    sessionId: payload.sid,
    accountStatus: payload.account_status
  };

  if (!authContext.userId || !authContext.role || !authContext.sessionId) {
    return res.status(401).json(error("Unauthorized", "INVALID_TOKEN_PAYLOAD"));
  }

  if (
    Array.isArray(route.allowedRoles) &&
    route.allowedRoles.length > 0 &&
    !route.allowedRoles.includes(authContext.role)
  ) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }

  req.auth = authContext;
  return next();
});

app.use(async (req, res) => {
  const route = req.matchedRoute;
  if (route.localHandler) {
    return route.localHandler(req, res);
  }

  const spoofedHeaders = [
    "x-user-id",
    "x-user-role",
    "x-user-email",
    "x-user-name",
    "x-session-id"
  ].filter((header) => req.header(header));
  if (spoofedHeaders.length > 0) {
    log("warn", "gateway.auth.spoofed_headers", {
      headers: spoofedHeaders,
      path: req.path
    });
  }

  const incomingUrl = new URL(req.originalUrl, "http://gateway.local");
  const targetPath = interpolatePath(route.targetPath, req.matchedRouteParams);
  const targetBaseUrl = route.targetBaseUrl || config.identityServiceUrl;
  const targetUrl = new URL(targetPath, targetBaseUrl);
  targetUrl.search = incomingUrl.search;

  const headers = {
    "x-correlation-id": req.correlationId
  };

  if (req.header("content-type")) {
    headers["content-type"] = req.header("content-type");
  }

  if (req.auth) {
    headers["x-user-id"] = req.auth.userId;
    headers["x-user-role"] = req.auth.role;
    headers["x-session-id"] = req.auth.sessionId;
    if (req.auth.email) {
      headers["x-user-email"] = req.auth.email;
    }
    if (req.auth.name) {
      headers["x-user-name"] = req.auth.name;
    }
  }

  const requestInit = {
    method: req.method,
    headers
  };

  if (!["GET", "HEAD"].includes(req.method)) {
    requestInit.body = JSON.stringify(req.body || {});
  }

  let upstreamResponse;
  try {
    upstreamResponse = await fetchWithTimeout(targetUrl, requestInit);
  } catch (err) {
    if (err?.name === "AbortError") {
      return res.status(504).json(error("Upstream timeout", "UPSTREAM_TIMEOUT"));
    }
    return res.status(502).json(error("Bad gateway", "UPSTREAM_UNREACHABLE"));
  }

  const contentType = upstreamResponse.headers.get("content-type") || "";
  const responseText = await upstreamResponse.text();

  res.status(upstreamResponse.status);
  if (contentType) {
    res.setHeader("content-type", contentType);
  }

  if (contentType.includes("application/json")) {
    if (!responseText) {
      return res.send({});
    }
    try {
      return res.send(JSON.parse(responseText));
    } catch {
      return res
        .status(502)
        .json(error("Invalid upstream response", "UPSTREAM_INVALID_RESPONSE"));
    }
  }

  return res.send(responseText);
});

app.listen(config.port, () => {
  log("info", "service.started", {
    port: config.port
  });
});
