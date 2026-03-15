import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";

import express from "express";
import pg from "pg";

import { ensureSchema } from "./db/schema.js";
import { createRegistrationRepository } from "./repositories/registrationRepository.js";

const { Pool } = pg;

const config = {
  serviceName: "registration-service",
  port: Number(process.env.PORT || 4003),
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@127.0.0.1:5432/evenements_registration",
  dbAutoMigrate: process.env.DB_AUTO_MIGRATE !== "false",
  eventManagementServiceUrl:
    process.env.EVENT_MANAGEMENT_SERVICE_URL || "http://127.0.0.1:4002"
};

const allowedParticipantRoles = new Set(["PARTICIPANT"]);
const allowedOrganizerRoles = new Set(["ORGANIZER", "ADMIN"]);
const allowedStatuses = new Set(["CONFIRMED", "WAITLISTED", "CANCELLED"]);

const pool = new Pool({
  connectionString: config.databaseUrl
});
const repository = createRegistrationRepository(pool);

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

function authContext(req) {
  const userId = String(req.header("x-user-id") || "").trim();
  const role = String(req.header("x-user-role") || "").trim().toUpperCase();
  const sessionId = String(req.header("x-session-id") || "").trim();

  if (!userId || !role || !sessionId) {
    return null;
  }

  return {
    userId,
    role,
    sessionId
  };
}

function toParticipationView(item) {
  return {
    registrationId: item.registrationId,
    eventId: item.eventId,
    eventTitle: item.eventTitle,
    eventCity: item.eventCity,
    eventStartAt: item.eventStartAt,
    registrationStatus: item.registrationStatus,
    waitlistPosition: item.waitlistPosition,
    canDownloadTicket:
      item.registrationStatus === "CONFIRMED" &&
      String(item.ticketId || "").trim().length > 0,
    ticketId: item.ticketId,
    updatedAt: item.updatedAt
  };
}

function toOrganizerRow(item) {
  return {
    registrationId: item.registrationId,
    participantName: item.participantName || item.participantEmail || item.participantId,
    status: item.registrationStatus,
    ticketRef: item.ticketRef || null
  };
}

function buildTicketRef(eventId, registrationId) {
  return `TCK-${String(eventId).slice(0, 4).toUpperCase()}-${String(registrationId)
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase()}`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  return { response, payload };
}

async function fetchPublicEvent(eventId) {
  try {
    const { response, payload } = await fetchJson(
      `${config.eventManagementServiceUrl}/catalog/events/${encodeURIComponent(eventId)}`
    );
    if (!response.ok) return null;
    return payload?.data || payload || null;
  } catch {
    return null;
  }
}

async function fetchManagedEvent(eventId, req) {
  try {
    const { response, payload } = await fetchJson(
      `${config.eventManagementServiceUrl}/events/drafts/${encodeURIComponent(eventId)}`,
      {
        headers: {
          "x-user-id": req.auth.userId,
          "x-user-role": req.auth.role,
          "x-session-id": req.auth.sessionId
        }
      }
    );
    if (!response.ok) return null;
    return payload?.data || payload || null;
  } catch {
    return null;
  }
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

app.use((req, _res, next) => {
  req.auth = authContext(req);
  next();
});

app.post("/registrations", async (req, res) => {
  if (!req.auth) {
    return res.status(401).json(error("Unauthorized", "MISSING_AUTH_CONTEXT"));
  }
  if (!allowedParticipantRoles.has(req.auth.role)) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }

  const eventId = String(req.body?.eventId || "").trim();
  if (!eventId) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", ["eventId is required"]));
  }

  const publicEvent = await fetchPublicEvent(eventId);
  if (!publicEvent) {
    return res.status(404).json(error("Event not found", "EVENT_NOT_FOUND"));
  }

  const existing = await repository.findActiveByEventAndParticipant(
    eventId,
    req.auth.userId
  );
  if (existing) {
    return res
      .status(409)
      .json(error("Registration already exists", "REGISTRATION_EXISTS"));
  }

  const confirmedCount = await repository.countConfirmedByEvent(eventId);
  const waitlistedCount = await repository.countWaitlistedByEvent(eventId);
  const status = confirmedCount < Number(publicEvent.capacity)
    ? "CONFIRMED"
    : "WAITLISTED";
  const registrationId = randomUUID();
  const timestamp = nowIso();
  const created = await repository.createRegistration({
    registrationId,
    eventId,
    participantId: req.auth.userId,
    participantName: req.header("x-user-name") || null,
    participantEmail: req.header("x-user-email") || null,
    eventTitle: publicEvent.title,
    eventCity: publicEvent.city,
    eventStartAt: publicEvent.startAt,
    eventCapacity: Number(publicEvent.capacity),
    registrationStatus: status,
    waitlistPosition: status === "WAITLISTED" ? waitlistedCount + 1 : null,
    ticketId: status === "CONFIRMED" ? `ticket-${registrationId}` : null,
    ticketRef:
      status === "CONFIRMED" ? buildTicketRef(eventId, registrationId) : null,
    createdAt: timestamp,
    updatedAt: timestamp,
    cancelledAt: null,
    promotedAt: null
  });

  return res.status(201).json(
    success({
      registrationId: created.registrationId,
      eventId: created.eventId,
      status: created.registrationStatus,
      waitlistPosition: created.waitlistPosition
    })
  );
});

app.post("/registrations/:registrationId/cancel", async (req, res) => {
  if (!req.auth) {
    return res.status(401).json(error("Unauthorized", "MISSING_AUTH_CONTEXT"));
  }
  if (!allowedParticipantRoles.has(req.auth.role)) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }

  const registration = await repository.findById(req.params.registrationId);
  if (!registration) {
    return res
      .status(404)
      .json(error("Registration not found", "REGISTRATION_NOT_FOUND"));
  }
  if (registration.participantId !== req.auth.userId) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }
  if (registration.registrationStatus === "CANCELLED") {
    return res
      .status(409)
      .json(error("Registration already cancelled", "REGISTRATION_NOT_CANCELLABLE"));
  }

  const timestamp = nowIso();
  const cancelled = await repository.cancelRegistration(
    registration.registrationId,
    timestamp
  );

  let promotedRegistrationId = null;
  if (registration.registrationStatus === "CONFIRMED") {
    const nextWaitlisted = await repository.findNextWaitlisted(registration.eventId);
    if (nextWaitlisted) {
      const promoted = await repository.promoteRegistration(
        nextWaitlisted.registrationId,
        timestamp,
        `ticket-${nextWaitlisted.registrationId}`,
        buildTicketRef(nextWaitlisted.eventId, nextWaitlisted.registrationId)
      );
      promotedRegistrationId = promoted.registrationId;
    }
  }

  return res.status(200).json(
    success({
      registrationId: cancelled.registrationId,
      status: cancelled.registrationStatus,
      promotedRegistrationId
    })
  );
});

app.get("/profile/participations", async (req, res) => {
  if (!req.auth) {
    return res.status(401).json(error("Unauthorized", "MISSING_AUTH_CONTEXT"));
  }
  if (!allowedParticipantRoles.has(req.auth.role)) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }

  const page = Number.parseInt(String(req.query.page || 1), 10);
  const pageSize = Number.parseInt(String(req.query.pageSize || 20), 10);
  const status = String(req.query.status || "").trim().toUpperCase() || null;
  if (!Number.isInteger(page) || page <= 0 || !Number.isInteger(pageSize) || pageSize <= 0 || pageSize > 100) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "page and pageSize must be positive integers and pageSize <= 100"
      ]));
  }
  if (status && !allowedStatuses.has(status)) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", ["status is invalid"]));
  }

  const result = await repository.listParticipations({
    participantId: req.auth.userId,
    status,
    page,
    pageSize
  });

  return res.status(200).json(
    success({
      items: result.items.map(toParticipationView),
      page,
      pageSize,
      total: result.total
    })
  );
});

app.get("/organizer/events/:eventId/registrations", async (req, res) => {
  if (!req.auth) {
    return res.status(401).json(error("Unauthorized", "MISSING_AUTH_CONTEXT"));
  }
  if (!allowedOrganizerRoles.has(req.auth.role)) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }

  const managedEvent = await fetchManagedEvent(req.params.eventId, req);
  if (!managedEvent) {
    return res.status(404).json(error("Event not found", "EVENT_NOT_FOUND"));
  }

  const items = await repository.listEventRegistrations(req.params.eventId);
  return res.status(200).json(
    success({
      event: {
        eventId: managedEvent.eventId,
        title: managedEvent.title
      },
      items: items.map(toOrganizerRow)
    })
  );
});

app.use((_req, res) => {
  res.status(404).json(error("Route not found", "NOT_FOUND"));
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
