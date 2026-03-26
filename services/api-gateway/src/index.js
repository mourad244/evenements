import { randomUUID } from "node:crypto";

import express from "express";
import jwt from "jsonwebtoken";

const config = {
  serviceName: "api-gateway",
  port: Number(process.env.PORT || 4000),
  identityServiceUrl: process.env.IDENTITY_SERVICE_URL || "http://127.0.0.1:4001",
  eventManagementServiceUrl:
    process.env.EVENT_MANAGEMENT_SERVICE_URL || "http://127.0.0.1:4002",
  registrationServiceUrl:
    process.env.REGISTRATION_SERVICE_URL || "http://127.0.0.1:4003",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret"
};

const app = express();
app.use(express.json());

const routeTable = [
  {
    method: "POST",
    path: "/api/auth/register",
    public: true,
    serviceTarget: "identityServiceUrl",
    targetPath: "/auth/register"
  },
  {
    method: "POST",
    path: "/api/auth/login",
    public: true,
    serviceTarget: "identityServiceUrl",
    targetPath: "/auth/login"
  },
  {
    method: "POST",
    path: "/api/auth/refresh",
    public: true,
    serviceTarget: "identityServiceUrl",
    targetPath: "/auth/refresh"
  },
  {
    method: "POST",
    path: "/api/auth/forgot-password",
    public: true,
    serviceTarget: "identityServiceUrl",
    targetPath: "/auth/forgot-password"
  },
  {
    method: "POST",
    path: "/api/auth/reset-password",
    public: true,
    serviceTarget: "identityServiceUrl",
    targetPath: "/auth/reset-password"
  },
  {
    method: "GET",
    path: "/api/auth/me",
    public: false,
    allowedRoles: ["PARTICIPANT", "ORGANIZER", "ADMIN"],
    serviceTarget: "identityServiceUrl",
    targetPath: "/auth/me"
  },
  {
    method: "POST",
    path: "/api/events/drafts",
    public: false,
    allowedRoles: ["ORGANIZER", "ADMIN"],
    serviceTarget: "eventManagementServiceUrl",
    targetPath: "/events/drafts"
  },
  {
    method: "GET",
    path: "/api/events/drafts",
    public: false,
    allowedRoles: ["ORGANIZER", "ADMIN"],
    serviceTarget: "eventManagementServiceUrl",
    targetPath: "/events/drafts"
  },
  {
    method: "GET",
    path: "/api/events/drafts/:eventId",
    public: false,
    allowedRoles: ["ORGANIZER", "ADMIN"],
    serviceTarget: "eventManagementServiceUrl",
    targetPath: ({ eventId }) => `/events/drafts/${eventId}`
  },
  {
    method: "PATCH",
    path: "/api/events/drafts/:eventId",
    public: false,
    allowedRoles: ["ORGANIZER", "ADMIN"],
    serviceTarget: "eventManagementServiceUrl",
    targetPath: ({ eventId }) => `/events/drafts/${eventId}`
  },
  {
    method: "DELETE",
    path: "/api/events/drafts/:eventId",
    public: false,
    allowedRoles: ["ORGANIZER", "ADMIN"],
    serviceTarget: "eventManagementServiceUrl",
    targetPath: ({ eventId }) => `/events/drafts/${eventId}`
  },
  {
    method: "POST",
    path: "/api/events/drafts/:eventId/publish",
    public: false,
    allowedRoles: ["ORGANIZER", "ADMIN"],
    serviceTarget: "eventManagementServiceUrl",
    targetPath: ({ eventId }) => `/events/drafts/${eventId}/publish`
  },
  {
    method: "POST",
    path: "/api/events/:eventId/cancel",
    public: false,
    allowedRoles: ["ORGANIZER", "ADMIN"],
    serviceTarget: "eventManagementServiceUrl",
    targetPath: ({ eventId }) => `/events/${eventId}/cancel`
  },
  {
    method: "GET",
    path: "/api/events/me",
    public: false,
    allowedRoles: ["ORGANIZER", "ADMIN"],
    serviceTarget: "eventManagementServiceUrl",
    targetPath: "/events/me"
  },
  {
    method: "POST",
    path: "/api/registrations",
    public: false,
    allowedRoles: ["PARTICIPANT"],
    serviceTarget: "registrationServiceUrl",
    targetPath: "/registrations"
  },
  {
    method: "POST",
    path: "/api/registrations/:registrationId/cancel",
    public: false,
    allowedRoles: ["PARTICIPANT"],
    serviceTarget: "registrationServiceUrl",
    targetPath: ({ registrationId }) => `/registrations/${registrationId}/cancel`
  },
  {
    method: "GET",
    path: "/api/profile/participations",
    public: false,
    allowedRoles: ["PARTICIPANT"],
    serviceTarget: "registrationServiceUrl",
    targetPath: "/profile/participations"
  },
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

const compiledRoutes = routeTable.map(compileRoute);

function normalizePath(path) {
  const trimmed = String(path || "").trim();
  if (!trimmed || trimmed === "/") return "/";
  return trimmed.replace(/\/+$/, "");
}

function escapeRegexLiteral(value) {
  return value.replace(/[|\\{}()[\]^$+*?.-]/g, "\\$&");
}

function compileRoute(route) {
  const normalizedPath = normalizePath(route.path);
  if (normalizedPath === "/") {
    return {
      ...route,
      method: route.method.toUpperCase(),
      matcher: /^\/$/
    };
  }

  const pattern = normalizedPath
    .split("/")
    .filter(Boolean)
    .map((segment) =>
      segment.startsWith(":")
        ? `(?<${segment.slice(1)}>[^/]+)`
        : escapeRegexLiteral(segment)
    )
    .join("/");

  return {
    ...route,
    method: route.method.toUpperCase(),
    matcher: new RegExp(`^/${pattern}$`)
  };
}

function resolveTargetPath(route, params) {
  if (typeof route.targetPath === "function") {
    return route.targetPath(params);
  }
  return route.targetPath;
}

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
  const normalizedPath = normalizePath(req.path);
  for (const route of compiledRoutes) {
    if (route.method !== req.method.toUpperCase()) continue;

    const match = route.matcher.exec(normalizedPath);
    if (match) {
      return {
        route,
        params: match.groups || {}
      };
    }
  }

  return null;
}

function parseBearerToken(authorizationHeader) {
  if (!authorizationHeader) return null;
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

app.use((req, res, next) => {
  const incoming = String(req.header("x-correlation-id") || "").trim();
  req.correlationId = incoming || randomUUID();
  res.setHeader("x-correlation-id", req.correlationId);
  next();
});

app.get("/health", (_req, res) => {
  res.status(200).json(
    success({
      status: "ok",
      service: config.serviceName
    })
  );
});

app.get("/ready", (_req, res) => {
  res.status(200).json(
    success({
      status: "ready",
      service: config.serviceName
    })
  );
});

app.use((req, res, next) => {
  const routeMatch = getRoute(req);
  if (!routeMatch) {
    return res.status(404).json(error("Route not found", "NOT_FOUND"));
  }

  req.matchedRoute = routeMatch.route;
  req.routeParams = routeMatch.params;
  if (req.matchedRoute.public) return next();

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
    role: payload.role,
    sessionId: payload.sid,
    accountStatus: payload.account_status
  };

  if (!authContext.userId || !authContext.role || !authContext.sessionId) {
    return res.status(401).json(error("Unauthorized", "INVALID_TOKEN_PAYLOAD"));
  }

  if (
    Array.isArray(req.matchedRoute.allowedRoles) &&
    req.matchedRoute.allowedRoles.length > 0 &&
    !req.matchedRoute.allowedRoles.includes(authContext.role)
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

  const upstreamBaseUrl = config[route.serviceTarget];
  const incomingUrl = new URL(req.originalUrl, "http://gateway.local");
  const targetPath = resolveTargetPath(route, req.routeParams || {});
  const targetUrl = new URL(targetPath, upstreamBaseUrl);
  targetUrl.search = incomingUrl.search;

  const headers = {
    "x-correlation-id": req.correlationId
  };

  if (req.header("content-type")) {
    headers["content-type"] = req.header("content-type");
  }
  if (req.header("idempotency-key")) {
    headers["idempotency-key"] = req.header("idempotency-key");
  }

  if (req.auth) {
    headers["x-user-id"] = req.auth.userId;
    headers["x-user-role"] = req.auth.role;
    headers["x-session-id"] = req.auth.sessionId;
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
    upstreamResponse = await fetch(targetUrl, requestInit);
  } catch {
    return res.status(502).json(error("Bad gateway", "UPSTREAM_UNREACHABLE"));
  }

  const contentType = upstreamResponse.headers.get("content-type") || "";
  const responseText = await upstreamResponse.text();

  res.status(upstreamResponse.status);
  if (contentType) {
    res.setHeader("content-type", contentType);
  }

  if (contentType.includes("application/json")) {
    return res.send(responseText ? JSON.parse(responseText) : {});
  }

  return res.send(responseText);
});

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(
    `[${config.serviceName}] listening on port ${config.port}`
  );
});
