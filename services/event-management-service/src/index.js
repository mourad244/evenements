import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";

import express from "express";
import pg from "pg";

import { ensureSchema } from "./db/schema.js";
import { createEventRepository } from "./repositories/eventRepository.js";

const { Pool } = pg;

const config = {
  serviceName: "event-management-service",
  port: Number(process.env.PORT || 4002),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@127.0.0.1:5432/evenements_event_management",
  dbAutoMigrate: process.env.DB_AUTO_MIGRATE !== "false"
};

const allowedVisibility = new Set(["PUBLIC", "PRIVATE"]);
const allowedPricingType = new Set(["FREE", "PAID"]);

const pool = new Pool({
  connectionString: config.databaseUrl
});
const repository = createEventRepository(pool);

const app = express();
app.use(express.json());

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

function nowIso() {
  return new Date().toISOString();
}

function toEventResponse(event) {
  return {
    eventId: event.eventId,
    organizerId: event.organizerId,
    title: event.title,
    description: event.description,
    theme: event.theme,
    venueName: event.venueName,
    city: event.city,
    startAt: event.startAt,
    endAt: event.endAt,
    timezone: event.timezone,
    capacity: event.capacity,
    visibility: event.visibility,
    pricingType: event.pricingType,
    status: event.status,
    coverImageRef: event.coverImageRef,
    publishedAt: event.publishedAt,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt
  };
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function validateDraftPayload(payload, { partial = false } = {}) {
  const body = payload || {};
  const details = [];

  const requiredFields = [
    "title",
    "description",
    "theme",
    "venueName",
    "city",
    "startAt",
    "timezone",
    "capacity",
    "visibility",
    "pricingType"
  ];

  if (!partial) {
    for (const field of requiredFields) {
      if (
        !Object.hasOwn(body, field) ||
        body[field] === undefined ||
        body[field] === null ||
        (typeof body[field] === "string" && body[field].trim() === "")
      ) {
        details.push(`${field} is required`);
      }
    }
  }

  const candidate = {};
  for (const key of [
    "title",
    "description",
    "theme",
    "venueName",
    "city",
    "startAt",
    "endAt",
    "timezone",
    "capacity",
    "visibility",
    "pricingType",
    "coverImageRef"
  ]) {
    if (Object.hasOwn(body, key)) {
      candidate[key] = body[key];
    }
  }

  if (Object.hasOwn(candidate, "capacity")) {
    const numericCapacity = Number(candidate.capacity);
    if (!Number.isInteger(numericCapacity) || numericCapacity <= 0) {
      details.push("capacity must be a positive integer");
    } else {
      candidate.capacity = numericCapacity;
    }
  }

  if (Object.hasOwn(candidate, "visibility")) {
    const visibility = String(candidate.visibility || "").toUpperCase();
    if (!allowedVisibility.has(visibility)) {
      details.push("visibility must be PUBLIC or PRIVATE");
    } else {
      candidate.visibility = visibility;
    }
  }

  if (Object.hasOwn(candidate, "pricingType")) {
    const pricingType = String(candidate.pricingType || "").toUpperCase();
    if (!allowedPricingType.has(pricingType)) {
      details.push("pricingType must be FREE or PAID");
    } else {
      candidate.pricingType = pricingType;
    }
  }

  if (Object.hasOwn(candidate, "startAt")) {
    const startAtMs = Date.parse(candidate.startAt);
    if (Number.isNaN(startAtMs)) {
      details.push("startAt must be a valid ISO datetime");
    }
  }

  if (Object.hasOwn(candidate, "endAt") && candidate.endAt != null) {
    const endAtMs = Date.parse(candidate.endAt);
    if (Number.isNaN(endAtMs)) {
      details.push("endAt must be a valid ISO datetime");
    } else if (Object.hasOwn(candidate, "startAt")) {
      const startAtMs = Date.parse(candidate.startAt);
      if (!Number.isNaN(startAtMs) && endAtMs <= startAtMs) {
        details.push("endAt must be strictly after startAt");
      }
    }
  }

  return {
    isValid: details.length === 0,
    details,
    value: candidate
  };
}

function authContext(req) {
  const userId = String(req.header("x-user-id") || "").trim();
  const role = String(req.header("x-user-role") || "").trim().toUpperCase();
  const sessionId = String(req.header("x-session-id") || "").trim();
  const correlationId = String(req.header("x-correlation-id") || "").trim();

  if (!userId || !role || !sessionId) {
    return null;
  }
  return {
    userId,
    role,
    sessionId,
    correlationId
  };
}

function isOrganizerOrAdmin(context) {
  return context.role === "ORGANIZER" || context.role === "ADMIN";
}

function canAccessEvent(context, event) {
  if (context.role === "ADMIN") return true;
  return event.organizerId === context.userId;
}

app.get("/health", (_req, res) => {
  res.status(200).json(
    success({
      status: "ok",
      service: config.serviceName
    })
  );
});

app.get("/ready", async (_req, res) => {
  try {
    await repository.checkConnection();
    return res.status(200).json(
      success({
        status: "ready",
        service: config.serviceName
      })
    );
  } catch {
    return res.status(503).json(error("Service not ready", "DB_UNAVAILABLE"));
  }
});

app.use("/events", (req, res, next) => {
  const context = authContext(req);
  if (!context) {
    return res.status(401).json(error("Unauthorized", "MISSING_AUTH_CONTEXT"));
  }
  if (!isOrganizerOrAdmin(context)) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }
  req.auth = context;
  return next();
});

app.post("/events/drafts", async (req, res) => {
  const validation = validateDraftPayload(req.body, { partial: false });
  if (!validation.isValid) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", validation.details));
  }

  const timestamp = nowIso();
  const created = await repository.createDraft({
    eventId: randomUUID(),
    organizerId: req.auth.userId,
    ...validation.value,
    status: "DRAFT",
    publishedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null
  });

  return res.status(201).json(success(toEventResponse(created)));
});

app.get("/events/drafts", async (req, res) => {
  const page = parsePositiveInt(req.query.page, 1);
  const pageSize = parsePositiveInt(req.query.pageSize, 20);
  if (!page || !pageSize || pageSize > 100) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "page and pageSize must be positive integers and pageSize <= 100"
      ]));
  }

  const isAdmin = req.auth.role === "ADMIN";
  const result = await repository.listDrafts({
    organizerId: req.auth.userId,
    isAdmin,
    page,
    pageSize
  });

  return res.status(200).json(
    success({
      items: result.items.map(toEventResponse),
      page,
      pageSize,
      total: result.total
    })
  );
});

app.get("/events/drafts/:eventId", async (req, res) => {
  const event = await repository.findById(req.params.eventId);
  if (!event) {
    return res.status(404).json(error("Event not found", "EVENT_NOT_FOUND"));
  }
  if (!canAccessEvent(req.auth, event)) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }
  return res.status(200).json(success(toEventResponse(event)));
});

app.patch("/events/drafts/:eventId", async (req, res) => {
  const event = await repository.findById(req.params.eventId);
  if (!event) {
    return res.status(404).json(error("Event not found", "EVENT_NOT_FOUND"));
  }
  if (!canAccessEvent(req.auth, event)) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }
  if (event.status !== "DRAFT") {
    return res
      .status(422)
      .json(error("Only drafts can be edited", "EVENT_NOT_EDITABLE"));
  }

  const validation = validateDraftPayload(req.body, { partial: true });
  if (!validation.isValid) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", validation.details));
  }
  if (Object.keys(validation.value).length === 0) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "At least one editable field is required"
      ]));
  }

  const updated = await repository.updateDraft(
    event.eventId,
    validation.value,
    nowIso()
  );
  return res.status(200).json(success(toEventResponse(updated)));
});

app.delete("/events/drafts/:eventId", async (req, res) => {
  const event = await repository.findById(req.params.eventId);
  if (!event) {
    return res.status(404).json(error("Event not found", "EVENT_NOT_FOUND"));
  }
  if (!canAccessEvent(req.auth, event)) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }
  if (event.status !== "DRAFT") {
    return res
      .status(409)
      .json(error("Only drafts can be deleted", "EVENT_NOT_DELETABLE"));
  }

  await repository.softDeleteDraft(event.eventId, nowIso());
  return res.status(204).send();
});

app.use((_req, res) => {
  return res.status(404).json(error("Route not found", "NOT_FOUND"));
});

async function boot() {
  const maxDbBootAttempts = 30;
  for (let attempt = 1; attempt <= maxDbBootAttempts; attempt += 1) {
    try {
      if (config.dbAutoMigrate) {
        await ensureSchema(pool);
      } else {
        await repository.checkConnection();
      }
      break;
    } catch (err) {
      if (attempt === maxDbBootAttempts) {
        throw err;
      }
      await delay(500);
    }
  }

  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[${config.serviceName}] listening on port ${config.port}`);
  });
}

boot().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(`[${config.serviceName}] failed to boot`, err);
  process.exit(1);
});

async function shutdown() {
  await pool.end();
}

process.on("SIGTERM", () => {
  shutdown().finally(() => process.exit(0));
});

process.on("SIGINT", () => {
  shutdown().finally(() => process.exit(0));
});

