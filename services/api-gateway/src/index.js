import { randomUUID } from "node:crypto";

import express from "express";
import jwt from "jsonwebtoken";

const config = {
  serviceName: "api-gateway",
  port: Number(process.env.PORT || 4000),
  identityServiceUrl: process.env.IDENTITY_SERVICE_URL || "http://127.0.0.1:4001",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret"
};

const app = express();
app.use(express.json());

const routeTable = [
  {
    method: "POST",
    path: "/api/auth/register",
    public: true,
    targetPath: "/auth/register"
  },
  {
    method: "POST",
    path: "/api/auth/login",
    public: true,
    targetPath: "/auth/login"
  },
  {
    method: "POST",
    path: "/api/auth/refresh",
    public: true,
    targetPath: "/auth/refresh"
  },
  {
    method: "POST",
    path: "/api/auth/forgot-password",
    public: true,
    targetPath: "/auth/forgot-password"
  },
  {
    method: "POST",
    path: "/api/auth/reset-password",
    public: true,
    targetPath: "/auth/reset-password"
  },
  {
    method: "GET",
    path: "/api/auth/me",
    public: false,
    allowedRoles: ["PARTICIPANT", "ORGANIZER", "ADMIN"],
    targetPath: "/auth/me"
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

const routesByKey = new Map(routeTable.map((route) => [routeKey(route.method, route.path), route]));

function routeKey(method, path) {
  const normalizedPath = path.length > 1 ? path.replace(/\/+$/, "") : path;
  return `${method.toUpperCase()} ${normalizedPath}`;
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
  return routesByKey.get(routeKey(req.method, req.path));
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
  const route = getRoute(req);
  if (!route) {
    return res.status(404).json(error("Route not found", "NOT_FOUND"));
  }

  req.matchedRoute = route;
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

  const incomingUrl = new URL(req.originalUrl, "http://gateway.local");
  const targetUrl = new URL(route.targetPath, config.identityServiceUrl);
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

