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
    "postgres://postgres:postgres@127.0.0.1:55432/evenements_s1_m01",
  dbAutoMigrate: process.env.DB_AUTO_MIGRATE !== "false",
  registrationServiceUrl:
    process.env.REGISTRATION_SERVICE_URL || "http://127.0.0.1:4003"
};

const allowedVisibility = new Set(["PUBLIC", "PRIVATE"]);
const allowedPricingType = new Set(["FREE", "PAID"]);
const allowedPublishModes = new Set(["IMMEDIATE", "SCHEDULED"]);
const allowedManagedEventStatuses = new Set([
  "DRAFT",
  "PUBLISHED",
  "FULL",
  "CLOSED",
  "ARCHIVED",
  "CANCELLED"
]);

const pool = new Pool({
  connectionString: config.databaseUrl
});
const repository = createEventRepository(pool);
let scheduledPublishInterval;

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

function logPublishedEvent(event, publishedAt) {
  // Keep the async publish transition observable for smoke checks and logs.
  // This is intentionally a structured message rather than a bus integration.
  // eslint-disable-next-line no-console
  console.info(
    `[${config.serviceName}] event.published ${JSON.stringify({
      eventId: event.eventId,
      organizerId: event.organizerId,
      status: event.status,
      visibility: event.visibility,
      title: event.title,
      theme: event.theme,
      city: event.city,
      venueName: event.venueName,
      startAt: event.startAt,
      publishedAt
    })}`
  );
}

function logCancelledEvent(event, cancelledAt, reasonCode, previousStatus) {
  // Keep the async cancel transition observable for smoke checks and logs.
  // This mirrors the publish trace so the lifecycle remains auditable.
  // eslint-disable-next-line no-console
  console.info(
    `[${config.serviceName}] event.cancelled ${JSON.stringify({
      eventId: event.eventId,
      organizerId: event.organizerId,
      previousStatus,
      status: event.status,
      visibility: event.visibility,
      title: event.title,
      theme: event.theme,
      city: event.city,
      venueName: event.venueName,
      startAt: event.startAt,
      cancelledAt,
      reasonCode,
      correlationId: event.correlationId || null
    })}`
  );
}

function toEventResponse(event) {
  return {
    id: event.eventId,
    eventId: event.eventId,
    organizerId: event.organizerId,
    title: event.title,
    description: event.description,
    theme: event.theme,
    venue: event.venueName,
    venueName: event.venueName,
    city: event.city,
    eventDate: event.startAt,
    eventStartAt: event.startAt,
    startAt: event.startAt,
    endAt: event.endAt,
    timezone: event.timezone,
    capacity: event.capacity,
    visibility: event.visibility,
    pricingType: event.pricingType,
    status: event.status,
    coverImageRef: event.coverImageRef,
    imageUrl: event.coverImageRef,
    scheduledPublishAt: event.scheduledPublishAt,
    publishedAt: event.publishedAt,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt
  };
}

function toCatalogEventSummary(event) {
  return {
    id: event.eventId,
    eventId: event.eventId,
    title: event.title,
    description: event.description,
    theme: event.theme,
    city: event.city,
    venue: event.venueName,
    venueName: event.venueName,
    eventDate: event.startAt,
    eventStartAt: event.startAt,
    startAt: event.startAt,
    endAt: event.endAt,
    timezone: event.timezone,
    capacity: event.capacity,
    visibility: event.visibility,
    pricingType: event.pricingType,
    status: event.status,
    coverImageRef: event.coverImageRef,
    imageUrl: event.coverImageRef,
    scheduledPublishAt: event.scheduledPublishAt,
    publishedAt: event.publishedAt
  };
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );
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

  if (Object.hasOwn(candidate, "coverImageRef") && candidate.coverImageRef != null) {
    const coverImageRef = String(candidate.coverImageRef).trim();
    if (!coverImageRef.startsWith("/")) {
      details.push("coverImageRef must be a public path that starts with /");
    } else if (coverImageRef.length > 2048) {
      details.push("coverImageRef must be at most 2048 characters");
    } else {
      candidate.coverImageRef = coverImageRef;
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

function validatePublishPayload(payload) {
  const body = payload || {};
  const details = [];
  const candidate = {};

  const publishMode = String(body.publishMode || "IMMEDIATE").trim().toUpperCase();
  if (!allowedPublishModes.has(publishMode)) {
    details.push("publishMode must be IMMEDIATE or SCHEDULED");
  } else {
    candidate.publishMode = publishMode;
  }

  if (Object.hasOwn(body, "scheduledAt") && body.scheduledAt != null) {
    const scheduledAt = String(body.scheduledAt).trim();
    const scheduledAtMs = Date.parse(scheduledAt);
    if (Number.isNaN(scheduledAtMs)) {
      details.push("scheduledAt must be a valid ISO datetime");
    } else {
      candidate.scheduledAt = scheduledAt;
      if (publishMode === "SCHEDULED" && scheduledAtMs <= Date.now()) {
        details.push("scheduledAt must be in the future for SCHEDULED publish");
      }
    }
  } else if (publishMode === "SCHEDULED") {
    details.push("scheduledAt is required when publishMode is SCHEDULED");
  }

  return {
    isValid: details.length === 0,
    details,
    value: candidate
  };
}

function validateManagedEventsQuery(query) {
  const body = query || {};
  const details = [];
  const value = {};

  if (Object.hasOwn(body, "status") && String(body.status || "").trim() !== "") {
    const status = String(body.status).trim().toUpperCase();
    if (!allowedManagedEventStatuses.has(status)) {
      details.push("status must be one of DRAFT, PUBLISHED, FULL, CLOSED, ARCHIVED, CANCELLED");
    } else {
      value.status = status;
    }
  }

  if (Object.hasOwn(body, "theme") && String(body.theme || "").trim() !== "") {
    value.theme = String(body.theme).trim();
  }

  if (Object.hasOwn(body, "fromDate") && String(body.fromDate || "").trim() !== "") {
    const fromDate = String(body.fromDate).trim();
    const fromDateMs = Date.parse(fromDate);
    if (Number.isNaN(fromDateMs)) {
      details.push("fromDate must be a valid ISO datetime");
    } else {
      value.fromDate = new Date(fromDateMs).toISOString();
    }
  }

  if (Object.hasOwn(body, "toDate") && String(body.toDate || "").trim() !== "") {
    const toDate = String(body.toDate).trim();
    const toDateMs = Date.parse(toDate);
    if (Number.isNaN(toDateMs)) {
      details.push("toDate must be a valid ISO datetime");
    } else {
      value.toDate = new Date(toDateMs).toISOString();
    }
  }

  if (value.fromDate && value.toDate && Date.parse(value.toDate) < Date.parse(value.fromDate)) {
    details.push("toDate must be greater than or equal to fromDate");
  }

  return {
    isValid: details.length === 0,
    details,
    value
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

async function emitNotification(path, payload, context) {
  try {
    await fetch(`${config.registrationServiceUrl}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-id": context.userId,
        "x-user-role": context.role,
        "x-session-id": context.sessionId,
        "x-correlation-id": context.correlationId || ""
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[event-management-service] notification emit failed", err);
  }
}

async function publishDueScheduledEvents() {
  const timestamp = nowIso();
  const publishedEvents = await repository.publishDueScheduledDrafts(timestamp, timestamp);
  for (const event of publishedEvents) {
    logPublishedEvent(event, timestamp);
  }
  return publishedEvents.length;
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

app.get("/catalog/events", async (req, res) => {
  const page = parsePositiveInt(req.query.page, 1);
  const pageSize = parsePositiveInt(req.query.pageSize, 20);
  if (!page || !pageSize || pageSize > 100) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "page and pageSize must be positive integers and pageSize <= 100"
      ]));
  }

  const from = req.query.from ? new Date(String(req.query.from)).toISOString() : null;
  const to = req.query.to ? new Date(String(req.query.to)).toISOString() : null;
  if ((req.query.from && Number.isNaN(Date.parse(String(req.query.from)))) ||
      (req.query.to && Number.isNaN(Date.parse(String(req.query.to))))) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "from and to must be valid ISO datetimes"
      ]));
  }

  const result = await repository.listPublicEvents({
    q: String(req.query.q || "").trim() || null,
    theme: String(req.query.theme || "").trim() || null,
    city: String(req.query.city || "").trim() || null,
    from,
    to,
    page,
    pageSize
  });

  return res.status(200).json(
    success({
      items: result.items.map(toCatalogEventSummary),
      page,
      pageSize,
      total: result.total
    })
  );
});

app.get("/catalog/events/:eventId", async (req, res) => {
  const eventId = String(req.params.eventId || "").trim();
  if (!isUuid(eventId)) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", ["eventId is invalid"]));
  }

  try {
    const event = await repository.findPublicById(eventId);
    if (!event) {
      return res.status(404).json(error("Event not found", "EVENT_NOT_FOUND"));
    }
    return res.status(200).json(success(toCatalogEventSummary(event)));
  } catch {
    return res.status(500).json(error("Failed to load event", "EVENT_LOOKUP_FAILED"));
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

app.use("/admin", (req, res, next) => {
  const context = authContext(req);
  if (!context) {
    return res.status(401).json(error("Unauthorized", "MISSING_AUTH_CONTEXT"));
  }
  if (context.role !== "ADMIN") {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }
  req.auth = context;
  return next();
});

app.get("/admin/events", async (req, res) => {
  const page = parsePositiveInt(req.query.page, 1);
  const pageSize = parsePositiveInt(req.query.pageSize, 20);
  if (!page || !pageSize || pageSize > 100) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "page and pageSize must be positive integers and pageSize <= 100"
      ]));
  }

  const result = await repository.listManagedEvents({
    organizerId: req.auth.userId,
    isAdmin: true,
    page,
    pageSize
  });

  return res.status(200).json(
    success({
      items: result.items.map(toEventResponse),
      page,
      pageSize,
      total: result.total,
      counts: result.counts
    })
  );
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

app.get("/events/me", async (req, res) => {
  const page = parsePositiveInt(req.query.page, 1);
  const pageSize = parsePositiveInt(req.query.pageSize, 20);
  if (!page || !pageSize || pageSize > 100) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "page and pageSize must be positive integers and pageSize <= 100"
      ]));
  }

  const filters = validateManagedEventsQuery(req.query);
  if (!filters.isValid) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", filters.details));
  }

  const result = await repository.listManagedEvents({
    organizerId: req.auth.userId,
    isAdmin: req.auth.role === "ADMIN",
    page,
    pageSize,
    ...filters.value
  });

  return res.status(200).json(
    success({
      items: result.items.map(toEventResponse),
      page,
      pageSize,
      total: result.total,
      counts: result.counts
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

app.post("/events/drafts/:eventId/publish", async (req, res) => {
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
      .json(error("Only drafts can be published", "EVENT_NOT_PUBLISHABLE"));
  }

  const validation = validatePublishPayload(req.body);
  if (!validation.isValid) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", validation.details));
  }

  const timestamp = nowIso();
  if (validation.value.publishMode === "SCHEDULED") {
    const scheduled = await repository.scheduleDraft(
      event.eventId,
      validation.value.scheduledAt,
      timestamp
    );
    return res.status(200).json(success(toEventResponse(scheduled)));
  }

  const published = await repository.publishDraft(event.eventId, timestamp, timestamp);
  logPublishedEvent(published, timestamp);
  await emitNotification(
    "/notifications/emit",
    {
      recipientId: published.organizerId,
      recipientRole: "ORGANIZER",
      eventId: published.eventId,
      notificationType: "EVENT_PUBLISHED",
      title: "Event published",
      message: `Your event \"${published.title}\" is now live.`,
      metadata: {
        eventTitle: published.title,
        eventCity: published.city,
        eventStartAt: published.startAt
      }
    },
    req.auth
  );
  return res.status(200).json(success(toEventResponse(published)));
});

app.post("/events/:eventId/cancel", async (req, res) => {
  const context = req.auth;
  if (!context) {
    return res.status(401).json(error("Unauthorized", "MISSING_AUTH_CONTEXT"));
  }

  const event = await repository.findById(req.params.eventId);
  if (!event) {
    return res.status(404).json(error("Event not found", "EVENT_NOT_FOUND"));
  }
  if (!canAccessEvent(context, event)) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }
  if (event.status === "CANCELLED") {
    return res
      .status(409)
      .json(error("Event already cancelled", "EVENT_ALREADY_CANCELLED"));
  }

  const previousStatus = event.status;
  const reasonCode = String(req.body?.reasonCode || "ORGANIZER_CANCELLED")
    .trim()
    .toUpperCase() || "ORGANIZER_CANCELLED";
  const timestamp = nowIso();
  const cancelled = await repository.cancelEvent(event.eventId, timestamp);
  logCancelledEvent(cancelled, timestamp, reasonCode, previousStatus);
  await emitNotification(
    "/notifications/event",
    {
      eventId: cancelled.eventId,
      notificationType: "EVENT_CANCELLED",
      title: "Event cancelled",
      message: `The event \"${cancelled.title}\" has been cancelled.`,
      metadata: {
        eventTitle: cancelled.title,
        eventCity: cancelled.city,
        eventStartAt: cancelled.startAt,
        cancelReasonCode: reasonCode,
        previousStatus
      }
    },
    context
  );
  return res.status(200).json(success(toEventResponse(cancelled)));
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

  await publishDueScheduledEvents().catch((err) => {
    // eslint-disable-next-line no-console
    console.warn(`[${config.serviceName}] scheduled publish sweep failed`, err);
  });
  scheduledPublishInterval = setInterval(() => {
    publishDueScheduledEvents().catch((err) => {
      // eslint-disable-next-line no-console
      console.warn(`[${config.serviceName}] scheduled publish sweep failed`, err);
    });
  }, 2000);
}

boot().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(`[${config.serviceName}] failed to boot`, err);
  process.exit(1);
});

async function shutdown() {
  if (scheduledPublishInterval) {
    clearInterval(scheduledPublishInterval);
  }
  await pool.end();
}

process.on("SIGTERM", () => {
  shutdown().finally(() => process.exit(0));
});

process.on("SIGINT", () => {
  shutdown().finally(() => process.exit(0));
});
