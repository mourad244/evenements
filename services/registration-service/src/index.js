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
    "postgres://postgres:postgres@127.0.0.1:55432/evenements_s1_m01",
  dbAutoMigrate: process.env.DB_AUTO_MIGRATE !== "false",
  eventManagementServiceUrl:
    process.env.EVENT_MANAGEMENT_SERVICE_URL || "http://127.0.0.1:4002"
};

const allowedParticipantRoles = new Set(["PARTICIPANT"]);
const allowedOrganizerRoles = new Set(["ORGANIZER", "ADMIN"]);
const allowedStatuses = new Set(["CONFIRMED", "WAITLISTED", "CANCELLED"]);
const allowedNotificationRoles = new Set(["PARTICIPANT", "ORGANIZER", "ADMIN"]);
const allowedPaymentStatuses = new Set([
  "PENDING",
  "SUCCEEDED",
  "FAILED",
  "CANCELLED"
]);
const ticketStatusIssued = "ISSUED";
const ticketStatusPending = "PENDING";
const ticketStatusCancelled = "CANCELLED";
const defaultTicketFormat = "PDF";
const defaultPaymentProvider = "manual";

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
  const canDownloadTicket =
    item.registrationStatus === "CONFIRMED" &&
    String(item.ticketId || "").trim().length > 0;

  return {
    id: item.registrationId,
    registrationId: item.registrationId,
    eventId: item.eventId,
    eventTitle: item.eventTitle,
    eventCity: item.eventCity,
    eventDate: item.eventStartAt,
    startAt: item.eventStartAt,
    eventStartAt: item.eventStartAt,
    registrationStatus: item.registrationStatus,
    status: item.registrationStatus,
    waitlistPosition: item.waitlistPosition,
    canDownloadTicket,
    ticketId: item.ticketId,
    ticketFormat: canDownloadTicket ? defaultTicketFormat : null,
    updatedAt: item.updatedAt
  };
}

function toOrganizerRow(item) {
  return {
    id: item.registrationId,
    registrationId: item.registrationId,
    participantName: item.participantName || item.participantEmail || item.participantId,
    participantEmail: item.participantEmail || null,
    status: item.registrationStatus,
    registrationStatus: item.registrationStatus,
    ticketId: item.ticketId || null,
    ticketRef: item.ticketRef || null
  };
}

function buildTicketRef(eventId, registrationId) {
  return `TCK-${String(eventId).slice(0, 4).toUpperCase()}-${String(registrationId)
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase()}`;
}

function csvEscape(value) {
  const normalized = value === null || value === undefined ? "" : String(value);
  const escaped = normalized.replace(/"/g, '""');
  return `"${escaped}"`;
}

function buildRegistrationsCsv(items) {
  const header = [
    "participantName",
    "participantEmail",
    "registrationStatus",
    "ticketRef",
    "createdAt"
  ];
  const rows = items.map((item) => [
    item.participantName || item.participantEmail || "",
    item.participantEmail || "",
    item.registrationStatus || "",
    item.ticketRef || "",
    item.createdAt || ""
  ]);

  return [
    header.map(csvEscape).join(","),
    ...rows.map((row) => row.map(csvEscape).join(","))
  ].join("\n");
}

function buildTicketPayload(registration) {
  return {
    ticketId: registration.ticketId,
    registrationId: registration.registrationId,
    eventId: registration.eventId,
    eventTitle: registration.eventTitle,
    eventCity: registration.eventCity,
    eventStartAt: registration.eventStartAt,
    participantId: registration.participantId,
    participantName: registration.participantName,
    ticketRef: registration.ticketRef,
    format: defaultTicketFormat,
    status: ticketStatusIssued,
    issuedAt: registration.createdAt
  };
}

async function ensureTicketForRegistration(registration, status, timestamp) {
  if (!registration) return null;

  let ticket = null;
  if (registration.ticketId) {
    ticket = await repository.findTicketById(registration.ticketId);
  }
  if (!ticket) {
    ticket = await repository.findTicketByRegistration(registration.registrationId);
  }

  let ticketId = registration.ticketId;
  let ticketRef = registration.ticketRef;
  if (!ticketId) {
    ticketId = randomUUID();
  }
  if (!ticketRef) {
    ticketRef = buildTicketRef(registration.eventId, registration.registrationId);
  }

  if (!registration.ticketId || !registration.ticketRef) {
    const updated = await repository.updateRegistrationTicket(
      registration.registrationId,
      ticketId,
      ticketRef,
      timestamp
    );
    registration.ticketId = updated.ticketId;
    registration.ticketRef = updated.ticketRef;
  }

  if (!ticket) {
    ticket = await repository.createTicket({
      ticketId,
      registrationId: registration.registrationId,
      eventId: registration.eventId,
      participantId: registration.participantId,
      ticketRef,
      ticketFormat: defaultTicketFormat,
      ticketStatus: status,
      payload: buildTicketPayload({
        ...registration,
        ticketId,
        ticketRef,
        createdAt: timestamp
      }),
      createdAt: timestamp,
      updatedAt: timestamp
    });
  } else if (ticket.ticketStatus !== status) {
    ticket = await repository.updateTicketStatus(ticket.ticketId, status, timestamp);
  }

  return ticket;
}

function toTicketView(ticket) {
  const payload = ticket.payload || {};
  return {
    ticketId: ticket.ticketId,
    registrationId: ticket.registrationId,
    eventId: ticket.eventId,
    participantId: ticket.participantId,
    ticketRef: ticket.ticketRef,
    format: ticket.ticketFormat,
    ticketFormat: ticket.ticketFormat,
    status: ticket.ticketStatus,
    eventTitle: payload.eventTitle || null,
    eventCity: payload.eventCity || null,
    eventStartAt: payload.eventStartAt || null,
    eventDate: payload.eventStartAt || null,
    participantName: payload.participantName || null,
    payload,
    issuedAt: ticket.createdAt,
    updatedAt: ticket.updatedAt
  };
}

function toNotificationView(notification) {
  return {
    id: notification.notificationId,
    notificationId: notification.notificationId,
    recipientId: notification.recipientId,
    recipientRole: notification.recipientRole,
    eventId: notification.eventId,
    registrationId: notification.registrationId,
    type: notification.notificationType,
    notificationType: notification.notificationType,
    title: notification.title,
    message: notification.message,
    metadata: notification.metadata,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    readAt: notification.readAt
  };
}

function toPaymentView(payment) {
  return {
    paymentId: payment.paymentId,
    registrationId: payment.registrationId,
    eventId: payment.eventId,
    participantId: payment.participantId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    provider: payment.provider,
    providerSessionId: payment.providerSessionId,
    providerPaymentId: payment.providerPaymentId,
    metadata: payment.metadata,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt
  };
}

function buildNotificationPayload({
  recipientId,
  recipientRole,
  eventId,
  registrationId,
  notificationType,
  title,
  message,
  metadata
}) {
  const timestamp = nowIso();
  return {
    notificationId: randomUUID(),
    recipientId,
    recipientRole,
    eventId: eventId || null,
    registrationId: registrationId || null,
    notificationType,
    title,
    message,
    metadata: metadata || {},
    isRead: false,
    createdAt: timestamp,
    readAt: null
  };
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
  const ticketId = status === "CONFIRMED" ? randomUUID() : null;
  const ticketRef = status === "CONFIRMED"
    ? buildTicketRef(eventId, registrationId)
    : null;
  const registrationPayload = {
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
    ticketId,
    ticketRef,
    createdAt: timestamp,
    updatedAt: timestamp,
    cancelledAt: null,
    promotedAt: null
  };

  let created;
  try {
    if (status === "CONFIRMED" && ticketId) {
      const result = await repository.createRegistrationWithTicket(
        registrationPayload,
        {
          ticketId,
          registrationId,
          eventId,
          participantId: req.auth.userId,
          ticketRef,
          ticketFormat: defaultTicketFormat,
          ticketStatus: ticketStatusIssued,
          payload: buildTicketPayload(registrationPayload),
          createdAt: timestamp,
          updatedAt: timestamp
        }
      );
      created = result.registration;
    } else {
      created = await repository.createRegistration(registrationPayload);
    }
  } catch {
    return res.status(500).json(error("Registration failed", "REGISTRATION_FAILED"));
  }

  if (status === "CONFIRMED") {
    try {
      await repository.createNotification(
        buildNotificationPayload({
          recipientId: created.participantId,
          recipientRole: "PARTICIPANT",
          eventId: created.eventId,
          registrationId: created.registrationId,
          notificationType: "REGISTRATION_CONFIRMED",
          title: "Registration confirmed",
          message: `You are confirmed for ${created.eventTitle}.`,
          metadata: {
            eventTitle: created.eventTitle,
            eventCity: created.eventCity,
            eventStartAt: created.eventStartAt
          }
        })
      );
    } catch {
      // Notification failures should not block registration creation.
    }
  }

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

  if (cancelled.ticketId) {
    await repository.updateTicketStatus(
      cancelled.ticketId,
      ticketStatusCancelled,
      timestamp
    );
  }

  let promotedRegistrationId = null;
  if (registration.registrationStatus === "CONFIRMED") {
    const nextWaitlisted = await repository.findNextWaitlisted(registration.eventId);
    if (nextWaitlisted) {
      const promotedTicketId = randomUUID();
      const promotedTicketRef = buildTicketRef(
        nextWaitlisted.eventId,
        nextWaitlisted.registrationId
      );
      const promotedTicketPayloadSource = {
        ...nextWaitlisted,
        ticketId: promotedTicketId,
        ticketRef: promotedTicketRef,
        createdAt: timestamp
      };
      const promotedTicketPayload = {
        ticketId: promotedTicketId,
        registrationId: nextWaitlisted.registrationId,
        eventId: nextWaitlisted.eventId,
        participantId: nextWaitlisted.participantId,
        ticketRef: promotedTicketRef,
        ticketFormat: defaultTicketFormat,
        ticketStatus: ticketStatusIssued,
        payload: buildTicketPayload(promotedTicketPayloadSource),
        createdAt: timestamp,
        updatedAt: timestamp
      };
      const promoted = await repository.promoteRegistrationWithTicket(
        nextWaitlisted.registrationId,
        timestamp,
        promotedTicketId,
        promotedTicketRef,
        promotedTicketPayload
      );
      promotedRegistrationId = promoted.registration.registrationId;
      try {
        await repository.createNotification(
          buildNotificationPayload({
            recipientId: promoted.registration.participantId,
            recipientRole: "PARTICIPANT",
            eventId: promoted.registration.eventId,
            registrationId: promoted.registration.registrationId,
            notificationType: "WAITLIST_PROMOTED",
            title: "You are off the waitlist",
            message: `You have been promoted for ${promoted.registration.eventTitle}.`,
            metadata: {
              eventTitle: promoted.registration.eventTitle,
              eventCity: promoted.registration.eventCity,
              eventStartAt: promoted.registration.eventStartAt
            }
          })
        );
      } catch {
        // Notification failures should not block the promotion path.
      }
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

app.get("/tickets/:ticketId", async (req, res) => {
  if (!req.auth) {
    return res.status(401).json(error("Unauthorized", "MISSING_AUTH_CONTEXT"));
  }
  if (!allowedParticipantRoles.has(req.auth.role)) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }

  const ticket = await repository.findTicketById(req.params.ticketId);
  if (!ticket) {
    return res.status(404).json(error("Ticket not found", "TICKET_NOT_FOUND"));
  }
  if (ticket.participantId !== req.auth.userId) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }
  if (ticket.ticketStatus !== ticketStatusIssued) {
    return res.status(410).json(error("Ticket inactive", "TICKET_INACTIVE"));
  }

  return res.status(200).json(success(toTicketView(ticket)));
});

app.get("/notifications", async (req, res) => {
  if (!req.auth) {
    return res.status(401).json(error("Unauthorized", "MISSING_AUTH_CONTEXT"));
  }
  if (!allowedNotificationRoles.has(req.auth.role)) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }

  const page = Number.parseInt(String(req.query.page || 1), 10);
  const pageSize = Number.parseInt(String(req.query.pageSize || 20), 10);
  if (!Number.isInteger(page) || page <= 0 || !Number.isInteger(pageSize) || pageSize <= 0 || pageSize > 100) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "page and pageSize must be positive integers and pageSize <= 100"
      ]));
  }

  const result = await repository.listNotifications({
    recipientId: req.auth.userId,
    page,
    pageSize
  });

  return res.status(200).json(
    success({
      items: result.items.map(toNotificationView),
      page,
      pageSize,
      total: result.total
    })
  );
});

app.patch("/notifications/:notificationId/read", async (req, res) => {
  if (!req.auth) {
    return res.status(401).json(error("Unauthorized", "MISSING_AUTH_CONTEXT"));
  }
  if (!allowedNotificationRoles.has(req.auth.role)) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }

  const notificationId = String(req.params.notificationId || "").trim();
  if (!notificationId) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "notificationId is required"
      ]));
  }

  const updated = await repository.markNotificationRead(
    notificationId,
    req.auth.userId,
    nowIso()
  );
  if (!updated) {
    return res
      .status(404)
      .json(error("Notification not found", "NOTIFICATION_NOT_FOUND"));
  }

  return res.status(200).json(success(toNotificationView(updated)));
});

app.post("/notifications/emit", async (req, res) => {
  if (!req.auth) {
    return res.status(401).json(error("Unauthorized", "MISSING_AUTH_CONTEXT"));
  }
  if (!allowedOrganizerRoles.has(req.auth.role)) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }

  const recipientId = String(req.body?.recipientId || "").trim();
  const recipientRole = String(req.body?.recipientRole || "").trim().toUpperCase();
  const notificationType = String(req.body?.notificationType || "").trim();
  const title = String(req.body?.title || "").trim();
  const message = String(req.body?.message || "").trim();

  if (!recipientId || !recipientRole || !notificationType || !title || !message) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "recipientId, recipientRole, notificationType, title, and message are required"
      ]));
  }

  const created = await repository.createNotification(
    buildNotificationPayload({
      recipientId,
      recipientRole,
      eventId: req.body?.eventId || null,
      registrationId: req.body?.registrationId || null,
      notificationType,
      title,
      message,
      metadata: req.body?.metadata || {}
    })
  );

  return res.status(201).json(success(toNotificationView(created)));
});

app.post("/notifications/event", async (req, res) => {
  if (!req.auth) {
    return res.status(401).json(error("Unauthorized", "MISSING_AUTH_CONTEXT"));
  }
  if (!allowedOrganizerRoles.has(req.auth.role)) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }

  const eventId = String(req.body?.eventId || "").trim();
  const notificationType = String(req.body?.notificationType || "").trim();
  const title = String(req.body?.title || "").trim();
  const message = String(req.body?.message || "").trim();
  if (!eventId || !notificationType || !title || !message) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "eventId, notificationType, title, and message are required"
      ]));
  }

  const items = await repository.listEventRegistrations(eventId);
  const eligible = items.filter((item) => item.registrationStatus !== "CANCELLED");

  let createdCount = 0;
  for (const item of eligible) {
    await repository.createNotification(
      buildNotificationPayload({
        recipientId: item.participantId,
        recipientRole: "PARTICIPANT",
        eventId,
        registrationId: item.registrationId,
        notificationType,
        title,
        message,
        metadata: {
          eventTitle: item.eventTitle,
          eventCity: item.eventCity,
          eventStartAt: item.eventStartAt
        }
      })
    );
    createdCount += 1;
  }

  return res.status(201).json(
    success({
      eventId,
      created: createdCount
    })
  );
});

app.post("/payments/session", async (req, res) => {
  if (!req.auth) {
    return res.status(401).json(error("Unauthorized", "MISSING_AUTH_CONTEXT"));
  }
  if (!allowedParticipantRoles.has(req.auth.role)) {
    return res.status(403).json(error("Forbidden", "FORBIDDEN"));
  }

  const amount = Number.parseInt(String(req.body?.amount ?? ""), 10);
  const currency = String(req.body?.currency || "").trim().toUpperCase();
  const registrationId = req.body?.registrationId || null;
  let eventId = req.body?.eventId || null;
  if (!Number.isInteger(amount) || amount < 0 || !currency) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "amount (>= 0) and currency are required"
      ]));
  }

  const timestamp = nowIso();
  let registration = null;
  if (registrationId) {
    registration = await repository.findById(registrationId);
    if (!registration) {
      return res
        .status(404)
        .json(error("Registration not found", "REGISTRATION_NOT_FOUND"));
    }
    if (registration.participantId !== req.auth.userId) {
      return res.status(403).json(error("Forbidden", "FORBIDDEN"));
    }
    if (registration.registrationStatus !== "CONFIRMED") {
      return res
        .status(409)
        .json(error("Registration not payable", "REGISTRATION_NOT_PAYABLE"));
    }
    eventId = registration.eventId;
    await ensureTicketForRegistration(registration, ticketStatusPending, timestamp);
  }

  const payment = await repository.createPaymentSession({
    paymentId: randomUUID(),
    registrationId,
    eventId,
    participantId: req.auth.userId,
    amount,
    currency,
    status: "PENDING",
    provider: String(req.body?.provider || defaultPaymentProvider),
    providerSessionId: randomUUID(),
    providerPaymentId: null,
    lastWebhookId: null,
    metadata: req.body?.metadata || {},
    createdAt: timestamp,
    updatedAt: timestamp
  });

  return res.status(201).json(success(toPaymentView(payment)));
});

app.post("/payments/webhook", async (req, res) => {
  const secret = String(process.env.PAYMENTS_WEBHOOK_SECRET || "").trim();
  if (secret) {
    const provided = String(req.header("x-webhook-secret") || "").trim();
    if (!provided || provided !== secret) {
      return res.status(401).json(error("Unauthorized", "WEBHOOK_UNAUTHORIZED"));
    }
  }

  const paymentId = String(req.body?.paymentId || "").trim();
  const providerSessionId = String(req.body?.providerSessionId || "").trim();
  const webhookId = String(req.body?.webhookId || "").trim();
  const status = String(req.body?.status || "").trim().toUpperCase();
  if (!webhookId) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "webhookId is required"
      ]));
  }
  if (!status || !allowedPaymentStatuses.has(status)) {
    return res
      .status(400)
      .json(error("Validation failed", "VALIDATION_ERROR", [
        "status is invalid"
      ]));
  }

  let payment = null;
  if (paymentId) {
    payment = await repository.findPaymentById(paymentId);
  } else if (providerSessionId) {
    payment = await repository.findPaymentByProviderSessionId(providerSessionId);
  }

  if (!payment) {
    return res.status(404).json(error("Payment not found", "PAYMENT_NOT_FOUND"));
  }

  if (payment.status === "SUCCEEDED" && status !== "SUCCEEDED") {
    return res.status(200).json(
      success({
        ...toPaymentView(payment),
        idempotent: true
      })
    );
  }

  const updated = await repository.updatePaymentStatus(
    payment.paymentId,
    status,
    req.body?.providerPaymentId || null,
    webhookId,
    nowIso()
  );
  const resolvedPayment = updated || payment;

  if (resolvedPayment.registrationId) {
    const registration = await repository.findById(resolvedPayment.registrationId);
    if (registration) {
      if (status === "SUCCEEDED") {
        await ensureTicketForRegistration(registration, ticketStatusIssued, nowIso());
      } else if (status === "FAILED" || status === "CANCELLED") {
        await ensureTicketForRegistration(
          registration,
          ticketStatusCancelled,
          nowIso()
        );
      }
    }
  }

  if (updated) {
    return res.status(200).json(success(toPaymentView(updated)));
  }

  const existing = await repository.findPaymentById(payment.paymentId);
  return res.status(200).json(
    success({
      ...toPaymentView(existing),
      idempotent: true
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

app.get("/organizer/events/:eventId/registrations/export", async (req, res) => {
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
  const csv = buildRegistrationsCsv(items);

  res.status(200);
  res.setHeader("content-type", "text/csv; charset=utf-8");
  res.setHeader(
    "content-disposition",
    `attachment; filename="registrations-${managedEvent.eventId}.csv"`
  );
  return res.send(csv);
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
