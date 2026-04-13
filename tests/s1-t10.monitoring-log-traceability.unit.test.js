/**
 * s1-t10.monitoring-log-traceability.unit.test.js  (M02.3)
 *
 * Validates that correlation-id propagation and structured log fields work
 * correctly across the shared observability module used by all P1 services.
 * No network, no DB — pure unit tests.
 */

import assert from "node:assert/strict";
import test from "node:test";

import {
  createCorrelationIdMiddleware,
  createJsonLogger,
  createRequestCompletionLogger,
  resolveCorrelationId
} from "../services/shared/observability.js";

// ── resolveCorrelationId ───────────────────────────────────────────────────

test("resolveCorrelationId preserves a valid incoming id", () => {
  const id = "abc-123-def";
  assert.equal(resolveCorrelationId(id), id);
});

test("resolveCorrelationId generates a new UUID when incoming is empty", () => {
  const id = resolveCorrelationId("");
  assert.ok(id.length > 0);
  assert.ok(/^[0-9a-f-]{36}$/i.test(id), "should look like a UUID");
});

test("resolveCorrelationId generates a new UUID when incoming is null", () => {
  const id = resolveCorrelationId(null);
  assert.ok(id.length > 0);
});

test("resolveCorrelationId uses custom idFactory when incoming is absent", () => {
  const id = resolveCorrelationId("", () => "custom-id-42");
  assert.equal(id, "custom-id-42");
});

test("resolveCorrelationId trims whitespace from incoming", () => {
  const id = resolveCorrelationId("  corr-id  ");
  assert.equal(id, "corr-id");
});

// ── createCorrelationIdMiddleware ──────────────────────────────────────────

function makeReq(correlationId) {
  return {
    headers: { "x-correlation-id": correlationId || "" },
    header(name) { return this.headers[name.toLowerCase()] ?? null; }
  };
}

function makeRes() {
  const headers = {};
  return {
    headers,
    setHeader(name, value) { this.headers[name] = value; }
  };
}

test("middleware assigns correlationId to req from header", () => {
  const middleware = createCorrelationIdMiddleware();
  const req = makeReq("trace-abc-123");
  const res = makeRes();
  let called = false;
  middleware(req, res, () => { called = true; });
  assert.equal(req.correlationId, "trace-abc-123");
  assert.equal(res.headers["x-correlation-id"], "trace-abc-123");
  assert.ok(called, "next() must be called");
});

test("middleware generates a correlationId when header is missing", () => {
  const middleware = createCorrelationIdMiddleware({ idFactory: () => "generated-id" });
  const req = makeReq("");
  const res = makeRes();
  middleware(req, res, () => {});
  assert.equal(req.correlationId, "generated-id");
  assert.equal(res.headers["x-correlation-id"], "generated-id");
});

test("middleware echoes back the correlation-id in the response header", () => {
  const middleware = createCorrelationIdMiddleware();
  const req = makeReq("echo-me");
  const res = makeRes();
  middleware(req, res, () => {});
  assert.equal(res.headers["x-correlation-id"], "echo-me");
});

test("middleware works when res has no setHeader (non-HTTP context)", () => {
  const middleware = createCorrelationIdMiddleware({ idFactory: () => "safe-id" });
  const req = makeReq("");
  const res = {}; // no setHeader
  assert.doesNotThrow(() => middleware(req, res, () => {}));
  assert.equal(req.correlationId, "safe-id");
});

// ── createJsonLogger ───────────────────────────────────────────────────────

test("createJsonLogger emits valid JSON with required fields", () => {
  const lines = [];
  const sink = { log: (l) => lines.push(JSON.parse(l)), error: (l) => lines.push(JSON.parse(l)) };
  const log = createJsonLogger("test-service", sink);

  log("info", "user.login", { userId: "u-1" });

  assert.equal(lines.length, 1);
  const entry = lines[0];
  assert.equal(entry.level, "info");
  assert.equal(entry.service, "test-service");
  assert.equal(entry.event, "user.login");
  assert.equal(entry.userId, "u-1");
  assert.ok(typeof entry.ts === "string", "ts must be present");
});

test("createJsonLogger routes error level to sink.error", () => {
  const errors = [];
  const sink = { log: () => {}, error: (l) => errors.push(JSON.parse(l)) };
  const log = createJsonLogger("svc", sink);

  log("error", "db.connection.failed", { message: "timeout" });

  assert.equal(errors.length, 1);
  assert.equal(errors[0].level, "error");
  assert.equal(errors[0].event, "db.connection.failed");
});

test("createJsonLogger includes correlationId when passed as field", () => {
  const lines = [];
  const sink = { log: (l) => lines.push(JSON.parse(l)), error: () => {} };
  const log = createJsonLogger("svc", sink);

  log("info", "event.published", { correlationId: "corr-xyz", eventId: "ev-1" });

  assert.equal(lines[0].correlationId, "corr-xyz");
  assert.equal(lines[0].eventId, "ev-1");
});

test("createJsonLogger service field is always present", () => {
  const lines = [];
  const sink = { log: (l) => lines.push(JSON.parse(l)), error: () => {} };
  const log = createJsonLogger("event-management-service", sink);

  log("info", "health.ok");

  assert.equal(lines[0].service, "event-management-service");
});

// ── createRequestCompletionLogger ──────────────────────────────────────────

function makeHttpReq(overrides = {}) {
  return {
    method: "GET",
    path: "/events/me",
    correlationId: "req-corr-1",
    header: () => null,
    headers: {},
    ...overrides
  };
}

function makeHttpRes(statusCode = 200) {
  const listeners = {};
  return {
    statusCode,
    on(event, cb) { listeners[event] = cb; },
    emit(event) { if (listeners[event]) listeners[event](); },
    setHeader: () => {}
  };
}

test("request completion logger emits structured log on finish", () => {
  const lines = [];
  const sink = { log: (l) => lines.push(JSON.parse(l)), error: () => {} };
  const log = createJsonLogger("gateway", sink);

  const middleware = createRequestCompletionLogger({
    log,
    eventName: "gateway.request.completed"
  });

  const req = makeHttpReq();
  const res = makeHttpRes(200);
  middleware(req, res, () => {});
  res.emit("finish");

  assert.equal(lines.length, 1);
  const entry = lines[0];
  assert.equal(entry.event, "gateway.request.completed");
  assert.equal(entry.method, "GET");
  assert.equal(entry.path, "/events/me");
  assert.equal(entry.statusCode, 200);
  assert.ok(typeof entry.durationMs === "number");
  assert.equal(entry.correlationId, "req-corr-1");
});

test("request completion logger passes correlationId through buildFields", () => {
  const lines = [];
  const sink = { log: (l) => lines.push(JSON.parse(l)), error: () => {} };
  const log = createJsonLogger("svc", sink);

  const middleware = createRequestCompletionLogger({
    log,
    eventName: "svc.request.completed",
    buildFields: (req) => ({ userId: req.userId || null, role: req.role || null })
  });

  const req = makeHttpReq({ userId: "u-99", role: "ORGANIZER" });
  const res = makeHttpRes(201);
  middleware(req, res, () => {});
  res.emit("finish");

  assert.equal(lines[0].userId, "u-99");
  assert.equal(lines[0].role, "ORGANIZER");
});

test("request completion logger respects isObserved filter", () => {
  const lines = [];
  const sink = { log: (l) => lines.push(l), error: () => {} };
  const log = createJsonLogger("svc", sink);

  const middleware = createRequestCompletionLogger({
    log,
    isObserved: (_req, res) => res.statusCode >= 400
  });

  const req = makeHttpReq();
  const res200 = makeHttpRes(200);
  middleware(req, res200, () => {});
  res200.emit("finish");
  assert.equal(lines.length, 0, "200 should not be logged");

  const res500 = makeHttpRes(500);
  middleware(req, res500, () => {});
  res500.emit("finish");
  assert.equal(lines.length, 1, "500 should be logged");
});

test("correlation-id is preserved end-to-end through middleware chain", () => {
  // Simulates: Gateway assigns x-correlation-id → forwards to service → service logs it
  const correlationMiddleware = createCorrelationIdMiddleware({ idFactory: () => "e2e-corr-id" });

  const lines = [];
  const sink = { log: (l) => lines.push(JSON.parse(l)), error: () => {} };
  const log = createJsonLogger("event-management-service", sink);

  const completionMiddleware = createRequestCompletionLogger({
    log,
    eventName: "event.request.completed",
    buildFields: (req) => ({ correlationId: req.correlationId || null })
  });

  // Use makeReq (has setHeader-compatible res) combined with makeHttpRes events
  const req = makeReq(""); // empty incoming → will be generated
  req.method = "GET";
  req.path = "/events/me";
  const res = makeRes(); // has setHeader + headers store
  const listeners = {};
  res.on = (ev, cb) => { listeners[ev] = cb; };
  res.emit = (ev) => { if (listeners[ev]) listeners[ev](); };
  res.statusCode = 200;

  correlationMiddleware(req, res, () => {});
  // Override idFactory effect: correlationMiddleware already ran with empty → generated
  assert.equal(req.correlationId, "e2e-corr-id");

  completionMiddleware(req, res, () => {});
  res.emit("finish");

  assert.equal(lines[0].correlationId, "e2e-corr-id");
  assert.equal(res.headers["x-correlation-id"], "e2e-corr-id");
});
