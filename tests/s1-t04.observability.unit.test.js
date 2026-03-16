import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import test from "node:test";

import {
  createCorrelationIdMiddleware,
  createJsonLogger,
  createRequestCompletionLogger
} from "../services/shared/observability.js";
import {
  gatewayAuthLogFields,
  isGatewayAuthPath
} from "../services/api-gateway/src/observabilityConfig.js";
import {
  identityAuthLogFields,
  isIdentityAuthPath
} from "../services/identity-access-service/src/observabilityConfig.js";

function createReq({
  method = "GET",
  path = "/",
  headers = {},
  matchedRoute = null,
  auth = null
} = {}) {
  const normalizedHeaders = {};
  for (const [key, value] of Object.entries(headers)) {
    normalizedHeaders[key.toLowerCase()] = value;
  }
  return {
    method,
    path,
    headers: normalizedHeaders,
    matchedRoute,
    auth,
    header(name) {
      return this.headers[String(name || "").toLowerCase()] || null;
    }
  };
}

function createRes(statusCode = 200) {
  const emitter = new EventEmitter();
  const headers = new Map();
  emitter.statusCode = statusCode;
  emitter.setHeader = (name, value) => {
    headers.set(String(name).toLowerCase(), String(value));
  };
  emitter.getHeader = (name) => headers.get(String(name).toLowerCase()) || null;
  return emitter;
}

function runMiddleware(middleware, req, res) {
  return new Promise((resolve, reject) => {
    try {
      middleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
}

test("correlation middleware preserves incoming header and generates when missing", async () => {
  const middleware = createCorrelationIdMiddleware({
    idFactory: () => "generated-correlation"
  });

  const reqWithHeader = createReq({
    headers: {
      "x-correlation-id": "provided-correlation"
    }
  });
  const resWithHeader = createRes();
  await runMiddleware(middleware, reqWithHeader, resWithHeader);
  assert.equal(reqWithHeader.correlationId, "provided-correlation");
  assert.equal(
    resWithHeader.getHeader("x-correlation-id"),
    "provided-correlation"
  );

  const reqWithoutHeader = createReq();
  const resWithoutHeader = createRes();
  await runMiddleware(middleware, reqWithoutHeader, resWithoutHeader);
  assert.equal(reqWithoutHeader.correlationId, "generated-correlation");
  assert.equal(
    resWithoutHeader.getHeader("x-correlation-id"),
    "generated-correlation"
  );
});

test("gateway auth completion logger emits structured auth fields only for auth paths", async () => {
  const entries = [];
  const logger = (level, event, fields) => {
    entries.push({ level, event, fields });
  };
  const correlation = createCorrelationIdMiddleware({
    idFactory: () => "corr-gateway"
  });
  const completion = createRequestCompletionLogger({
    log: logger,
    eventName: "gateway.auth.request.completed",
    isObserved: isGatewayAuthPath,
    buildFields: gatewayAuthLogFields
  });

  const authReq = createReq({
    method: "POST",
    path: "/api/auth/login",
    auth: { userId: "user-1", role: "ORGANIZER" },
    matchedRoute: { path: "/api/auth/login" }
  });
  const authRes = createRes(200);
  await runMiddleware(correlation, authReq, authRes);
  await runMiddleware(completion, authReq, authRes);
  authRes.emit("finish");

  assert.equal(entries.length, 1);
  assert.equal(entries[0].event, "gateway.auth.request.completed");
  assert.equal(entries[0].fields.correlationId, "corr-gateway");
  assert.equal(entries[0].fields.route, "/api/auth/login");
  assert.equal(entries[0].fields.userId, "user-1");
  assert.equal(entries[0].fields.role, "ORGANIZER");
  assert.equal(entries[0].fields.statusCode, 200);

  const nonAuthReq = createReq({
    method: "GET",
    path: "/api/events/drafts",
    matchedRoute: { path: "/api/events/drafts" }
  });
  const nonAuthRes = createRes(200);
  await runMiddleware(correlation, nonAuthReq, nonAuthRes);
  await runMiddleware(completion, nonAuthReq, nonAuthRes);
  nonAuthRes.emit("finish");

  assert.equal(entries.length, 1);
});

test("identity auth completion logger captures caller context", async () => {
  const entries = [];
  const logger = (level, event, fields) => {
    entries.push({ level, event, fields });
  };

  const completion = createRequestCompletionLogger({
    log: logger,
    eventName: "identity.auth.request.completed",
    isObserved: isIdentityAuthPath,
    buildFields: identityAuthLogFields
  });

  const req = createReq({
    method: "GET",
    path: "/auth/me",
    headers: {
      "x-user-id": "organizer-1",
      "x-user-role": "ORGANIZER",
      "x-correlation-id": "corr-identity"
    }
  });
  const res = createRes(200);

  await runMiddleware(
    createCorrelationIdMiddleware({
      idFactory: () => "unused"
    }),
    req,
    res
  );
  await runMiddleware(completion, req, res);
  res.emit("finish");

  assert.equal(entries.length, 1);
  assert.equal(entries[0].event, "identity.auth.request.completed");
  assert.equal(entries[0].fields.correlationId, "corr-identity");
  assert.equal(entries[0].fields.callerUserId, "organizer-1");
  assert.equal(entries[0].fields.callerRole, "ORGANIZER");
});

test("JSON logger emits parseable structured output", () => {
  const messages = [];
  const sink = {
    log: (line) => messages.push(line),
    error: (line) => messages.push(line)
  };
  const logger = createJsonLogger("api-gateway", sink);
  logger("info", "service.started", { port: 4000 });

  assert.equal(messages.length, 1);
  const parsed = JSON.parse(messages[0]);
  assert.equal(parsed.service, "api-gateway");
  assert.equal(parsed.level, "info");
  assert.equal(parsed.event, "service.started");
  assert.equal(parsed.port, 4000);
  assert.ok(parsed.ts);
});
