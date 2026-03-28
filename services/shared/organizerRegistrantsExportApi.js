const ALLOWED_EXPORT_FORMATS = new Set(["CSV"]);
const ALLOWED_REGISTRATION_STATUSES = new Set([
  "CONFIRMED",
  "WAITLISTED",
  "CANCELLED",
  "REJECTED"
]);

export function canAccessOrganizerRegistrants({
  actorRole,
  actorOrganizerId,
  eventOwnerOrganizerId
} = {}) {
  const role = String(actorRole || "").trim().toUpperCase();
  if (role === "ADMIN") {
    return true;
  }
  if (role !== "ORGANIZER") {
    return false;
  }
  return (
    normalizeOptionalString(actorOrganizerId) !== null &&
    normalizeOptionalString(actorOrganizerId) ===
      normalizeOptionalString(eventOwnerOrganizerId)
  );
}

export function normalizeRegistrantsExportFormat(format = "csv") {
  const normalized = String(format || "").trim().toUpperCase();
  return ALLOWED_EXPORT_FORMATS.has(normalized) ? normalized : null;
}

export function mapRegistrantExportRow(registration = {}) {
  return {
    registrationId: normalizeOptionalString(registration.registrationId),
    eventId: normalizeOptionalString(registration.eventId),
    eventTitle: normalizeOptionalString(registration.eventTitle),
    participantName: normalizeOptionalString(registration.participantName),
    participantEmail: normalizeOptionalString(registration.participantEmail),
    registrationStatus: normalizeRegistrationStatus(
      registration.registrationStatus
    ),
    waitlistPosition: normalizeNullableInteger(registration.waitlistPosition),
    ticketRef: normalizeOptionalString(registration.ticketRef),
    ticketStatus: normalizeOptionalString(registration.ticketStatus),
    registeredAt: normalizeIsoDate(
      registration.registeredAt || registration.createdAt
    ),
    updatedAt: normalizeIsoDate(registration.updatedAt)
  };
}

export function buildRegistrantsExportRequest({
  registrations = [],
  event = {},
  actor = {},
  format = "csv",
  correlationId = null,
  now = new Date().toISOString()
} = {}) {
  const role = String(actor.role || "").trim().toUpperCase();
  if (!role) {
    return reject(401, "UNAUTHENTICATED");
  }

  const eventId = normalizeOptionalString(event.eventId || event.id);
  const allowed = canAccessOrganizerRegistrants({
    actorRole: role,
    actorOrganizerId: actor.organizerId,
    eventOwnerOrganizerId: event.organizerId
  });
  if (!allowed) {
    return reject(403, "FORBIDDEN_SCOPE");
  }
  if (!eventId) {
    return reject(404, "EVENT_NOT_FOUND");
  }

  const normalizedFormat = normalizeRegistrantsExportFormat(format);
  if (!normalizedFormat) {
    return reject(400, "UNSUPPORTED_EXPORT_FORMAT");
  }

  const rows = registrations
    .filter((registration) => normalizeOptionalString(registration.eventId) === eventId)
    .map(mapRegistrantExportRow);

  const exportId = buildExportId(eventId, now);
  const filename = buildExportFilename(eventId, now, normalizedFormat);

  return {
    ok: true,
    statusCode: 202,
    data: {
      exportId,
      eventId,
      status: "READY",
      format: normalizedFormat.toLowerCase(),
      exportUrl: `/api/organizer/events/${encodeURIComponent(
        eventId
      )}/registrations/export/${encodeURIComponent(exportId)}/download`,
      filename,
      rowCount: rows.length,
      rows
    },
    audit: {
      action: "REGISTRANTS_EXPORT_REQUESTED",
      eventId,
      organizerId: normalizeOptionalString(actor.organizerId),
      role,
      exportId,
      rowCount: rows.length,
      correlationId: normalizeOptionalString(correlationId)
    }
  };
}

export function buildRegistrantsExportStatus({
  exportId,
  eventId,
  actor = {},
  eventOwnerOrganizerId,
  status = "READY",
  format = "csv",
  exportUrl = null,
  expiresAt = null,
  correlationId = null
} = {}) {
  const role = String(actor.role || "").trim().toUpperCase();
  if (!role) {
    return reject(401, "UNAUTHENTICATED");
  }

  const allowed = canAccessOrganizerRegistrants({
    actorRole: role,
    actorOrganizerId: actor.organizerId,
    eventOwnerOrganizerId
  });
  if (!allowed) {
    return reject(403, "FORBIDDEN_SCOPE");
  }

  const normalizedStatus = normalizeExportStatus(status);
  const normalizedFormat = normalizeRegistrantsExportFormat(format);
  if (!normalizedFormat) {
    return reject(400, "UNSUPPORTED_EXPORT_FORMAT");
  }

  return {
    ok: true,
    statusCode: 200,
    data: {
      exportId: normalizeOptionalString(exportId),
      eventId: normalizeOptionalString(eventId),
      status: normalizedStatus,
      format: normalizedFormat.toLowerCase(),
      exportUrl: normalizedStatus === "READY" ? normalizeOptionalString(exportUrl) : null,
      expiresAt: normalizeIsoDate(expiresAt),
      correlationId: normalizeOptionalString(correlationId)
    }
  };
}

function normalizeExportStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  if (normalized === "RUNNING" || normalized === "READY" || normalized === "FAILED") {
    return normalized;
  }
  return "FAILED";
}

function normalizeRegistrationStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return ALLOWED_REGISTRATION_STATUSES.has(normalized) ? normalized : "REJECTED";
}

function normalizeNullableInteger(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeIsoDate(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

function normalizeOptionalString(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function buildExportId(eventId, nowIso) {
  const safeEventId = String(eventId || "event").replace(/[^a-zA-Z0-9_-]/g, "");
  const stamp = String(nowIso || "").replace(/[^0-9]/g, "").slice(0, 14);
  return `exp_registrants_${safeEventId || "event"}_${stamp || "0"}`;
}

function buildExportFilename(eventId, nowIso, format) {
  const stamp = String(nowIso || "").replace(/[^0-9]/g, "").slice(0, 14);
  const safeEventId = String(eventId || "event").replace(/[^a-zA-Z0-9_-]/g, "");
  return `registrants-${safeEventId || "event"}-${stamp || "0"}.${String(
    format || "CSV"
  ).toLowerCase()}`;
}

function reject(statusCode, code, extra = {}) {
  return {
    ok: false,
    statusCode,
    error: {
      code,
      ...extra
    }
  };
}
