import { randomUUID } from "node:crypto";

export function resolveCorrelationId(incoming, idFactory = randomUUID) {
  const value = String(incoming || "").trim();
  return value || idFactory();
}

export function createJsonLogger(serviceName, sink = console) {
  return (level, event, fields = {}) => {
    const entry = {
      ts: new Date().toISOString(),
      level,
      service: serviceName,
      event,
      ...fields
    };
    const line = JSON.stringify(entry);
    if (level === "error") {
      sink.error(line);
      return;
    }
    sink.log(line);
  };
}

export function createCorrelationIdMiddleware({ idFactory } = {}) {
  return (req, res, next) => {
    const incoming = readHeader(req, "x-correlation-id");
    req.correlationId = resolveCorrelationId(incoming, idFactory || randomUUID);
    if (typeof res.setHeader === "function") {
      res.setHeader("x-correlation-id", req.correlationId);
    }
    next();
  };
}

export function createRequestCompletionLogger({
  log,
  eventName = "http.request.completed",
  isObserved = () => true,
  buildFields = () => ({})
}) {
  return (req, res, next) => {
    const startNs = process.hrtime.bigint();
    if (typeof res.on === "function") {
      res.on("finish", () => {
        if (!isObserved(req, res)) return;
        const durationMs = Number(process.hrtime.bigint() - startNs) / 1_000_000;
        const fields = {
          correlationId: req.correlationId || null,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          durationMs: Number(durationMs.toFixed(3)),
          ...buildFields(req, res)
        };
        log("info", eventName, fields);
      });
    }
    next();
  };
}

function readHeader(req, name) {
  if (typeof req.header === "function") {
    return req.header(name);
  }
  const headers = req.headers || {};
  return headers[name] ?? headers[name.toLowerCase()] ?? null;
}
