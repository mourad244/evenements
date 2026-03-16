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
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret"
};
const log = createJsonLogger(config.serviceName);

const app = express();
app.use(express.json());

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

app.get("/ready", (_req, res) => {
  res.status(200).json(
    success({
      status: "ready",
      service: config.serviceName
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
  log("info", "service.started", {
    port: config.port
  });
});
