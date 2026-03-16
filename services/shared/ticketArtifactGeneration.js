const SUPPORTED_ARTIFACT_FORMATS = new Set(["PDF", "PNG"]);
const ISSUABLE_REGISTRATION_STATUSES = new Set(["CONFIRMED"]);
const ISSUED_TICKET_STATUSES = new Set(["ISSUED"]);
const BLOCKED_TICKET_STATUSES = new Set(["VOIDED"]);
const DEFAULT_QR_BASE_PATH = "/api/tickets/verify";

export function normalizeArtifactFormat(format) {
  const normalized = String(format || "").trim().toUpperCase();
  return SUPPORTED_ARTIFACT_FORMATS.has(normalized) ? normalized : "PDF";
}

export function normalizeTicketLifecycleStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return normalized || "PENDING";
}

export function buildTicketReference({
  eventTitle,
  eventStartAt,
  ticketId,
  existingTicketRef = null
} = {}) {
  const persistedRef = normalizeOptionalString(existingTicketRef);
  if (persistedRef) {
    return persistedRef;
  }

  const safeTicketId = normalizeOptionalString(ticketId);
  if (!safeTicketId) {
    throw new Error("ticketId is required to build ticket reference");
  }

  const eventShort = buildEventShortCode(eventTitle);
  const eventDate = buildDateStamp(eventStartAt);
  const shortId = safeTicketId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(-6);
  return `TCK-${eventShort}-${eventDate}-${shortId || "000000"}`;
}

export function buildTicketArtifactFilename(ticketRef, { artifactFormat } = {}) {
  const safeTicketRef = normalizeOptionalString(ticketRef);
  if (!safeTicketRef) {
    throw new Error("ticketRef is required");
  }
  const normalizedFormat = normalizeArtifactFormat(artifactFormat);
  const extension = normalizedFormat === "PNG" ? "png" : "pdf";
  return `${safeTicketRef}.${extension}`;
}

export function buildParticipantTicketAccess({
  registrationStatus,
  ticketId,
  artifactFormat,
  ticketStatus
} = {}) {
  const normalizedRegistrationStatus = String(registrationStatus || "")
    .trim()
    .toUpperCase();
  const normalizedTicketStatus = normalizeTicketLifecycleStatus(ticketStatus);
  const resolvedTicketId = normalizeOptionalString(ticketId);

  const canDownload =
    ISSUABLE_REGISTRATION_STATUSES.has(normalizedRegistrationStatus) &&
    ISSUED_TICKET_STATUSES.has(normalizedTicketStatus) &&
    resolvedTicketId !== null;

  return {
    canDownloadTicket: canDownload,
    ticketId: canDownload ? resolvedTicketId : null,
    ticketFormat: canDownload ? normalizeArtifactFormat(artifactFormat) : null
  };
}

export function buildTicketQrPayload({
  ticketId,
  ticketRef,
  eventId,
  qrBasePath = DEFAULT_QR_BASE_PATH
} = {}) {
  const resolvedTicketId = normalizeOptionalString(ticketId);
  const resolvedTicketRef = normalizeOptionalString(ticketRef);
  const resolvedEventId = normalizeOptionalString(eventId);

  if (!resolvedTicketId || !resolvedTicketRef || !resolvedEventId) {
    throw new Error("ticketId, ticketRef and eventId are required");
  }

  const normalizedBasePath = String(qrBasePath || DEFAULT_QR_BASE_PATH).replace(
    /\/+$/,
    ""
  );

  return {
    format: "OPAQUE_URL",
    path: `${normalizedBasePath}/${encodeURIComponent(resolvedTicketId)}`,
    encodedValue: `${normalizedBasePath}/${encodeURIComponent(resolvedTicketId)}`,
    verification: {
      ticketId: resolvedTicketId,
      ticketRef: resolvedTicketRef,
      eventId: resolvedEventId
    }
  };
}

export function issueTicketArtifact({
  registration = {},
  event = {},
  existingTicket = null,
  ticketId = null,
  artifactFormat = "PDF",
  qrCodeEnabled = false,
  qrBasePath = DEFAULT_QR_BASE_PATH,
  correlationId = null,
  issuedAt = new Date().toISOString(),
  artifactBaseUrl = "https://media/tickets"
} = {}) {
  const normalizedRegistrationStatus = String(registration.status || "")
    .trim()
    .toUpperCase();
  const registrationId = normalizeOptionalString(registration.registrationId);
  const eventId = normalizeOptionalString(
    registration.eventId || event.eventId || event.id
  );
  const participantId = normalizeOptionalString(registration.participantId);

  if (!registrationId || !eventId || !participantId) {
    return reject(400, "INVALID_TICKET_CONTEXT");
  }

  if (!ISSUABLE_REGISTRATION_STATUSES.has(normalizedRegistrationStatus)) {
    return reject(409, "REGISTRATION_NOT_CONFIRMED", {
      registrationStatus: normalizedRegistrationStatus || "UNKNOWN"
    });
  }

  const normalizedFormat = normalizeArtifactFormat(artifactFormat);
  const persistedTicket = normalizeExistingTicket(existingTicket);
  if (
    persistedTicket &&
    persistedTicket.registrationId &&
    persistedTicket.registrationId !== registrationId
  ) {
    return reject(409, "TICKET_REGISTRATION_MISMATCH");
  }

  if (persistedTicket && BLOCKED_TICKET_STATUSES.has(persistedTicket.status)) {
    return reject(409, "TICKET_ALREADY_VOIDED");
  }

  if (persistedTicket && ISSUED_TICKET_STATUSES.has(persistedTicket.status)) {
    return buildIssuedResponse({
      registration,
      event,
      ticket: {
        ...persistedTicket,
        correlationId: normalizeOptionalString(correlationId) || persistedTicket.correlationId
      },
      format: normalizeArtifactFormat(
        persistedTicket.artifactFormat || normalizedFormat
      ),
      correlationId,
      idempotent: true
    });
  }

  const resolvedTicketId =
    normalizeOptionalString(ticketId) || `ticket_${registrationId}`;
  const ticketRef = buildTicketReference({
    eventTitle: event.title,
    eventStartAt: event.startAt,
    ticketId: resolvedTicketId,
    existingTicketRef: persistedTicket?.ticketRef
  });
  const filename = buildTicketArtifactFilename(ticketRef, {
    artifactFormat: normalizedFormat
  });
  const resolvedIssuedAt = normalizeIsoDate(issuedAt) || new Date().toISOString();
  const contentType =
    normalizedFormat === "PNG" ? "image/png" : "application/pdf";
  const artifactUrl = buildArtifactUrl({
    artifactBaseUrl,
    ticketId: resolvedTicketId,
    artifactFormat: normalizedFormat
  });

  const ticket = {
    ticketId: resolvedTicketId,
    ticketRef,
    registrationId,
    eventId,
    participantId,
    status: "ISSUED",
    artifactFormat: normalizedFormat,
    artifactUrl,
    artifactFilename: filename,
    artifactContentType: contentType,
    qrCodeEnabled: qrCodeEnabled === true,
    qrCode:
      qrCodeEnabled === true
        ? buildTicketQrPayload({
            ticketId: resolvedTicketId,
            ticketRef,
            eventId,
            qrBasePath
          })
        : null,
    issuedAt: resolvedIssuedAt,
    correlationId: normalizeOptionalString(correlationId)
  };

  return buildIssuedResponse({
    registration,
    event,
    ticket,
    format: normalizedFormat,
    correlationId,
    idempotent: false
  });
}

export function buildTicketGeneratedEvent({
  ticket,
  messageId = null,
  occurredAt = null,
  producer = "ticketing-service"
} = {}) {
  if (!ticket || !normalizeOptionalString(ticket.ticketId)) {
    throw new Error("ticket is required");
  }

  return {
    messageId:
      normalizeOptionalString(messageId) ||
      `msg_ticket_generated_${ticket.ticketId}`,
    eventName: "ticket.generated",
    version: 1,
    occurredAt: normalizeIsoDate(occurredAt || ticket.issuedAt) ||
      new Date().toISOString(),
    producer,
    correlationId: normalizeOptionalString(ticket.correlationId),
    data: {
      ticketId: ticket.ticketId,
      ticketRef: ticket.ticketRef,
      registrationId: ticket.registrationId,
      eventId: ticket.eventId,
      participantId: ticket.participantId,
      artifactFormat: ticket.artifactFormat,
      artifactUrl: ticket.artifactUrl,
      qrCodeEnabled: ticket.qrCodeEnabled === true,
      qrCode:
        ticket.qrCodeEnabled === true && ticket.qrCode
          ? {
              format: ticket.qrCode.format,
              path: ticket.qrCode.path
            }
          : null,
      issuedAt: ticket.issuedAt
    }
  };
}

function buildIssuedResponse({
  registration,
  event,
  ticket,
  format,
  correlationId,
  idempotent
}) {
  return {
    ok: true,
    statusCode: idempotent ? 200 : 201,
    data: {
      ticket,
      registrationProjection: buildParticipantTicketAccess({
        registrationStatus: registration.status,
        ticketId: ticket.ticketId,
        artifactFormat: format,
        ticketStatus: ticket.status
      }),
      event: buildTicketGeneratedEvent({
        ticket,
        occurredAt: ticket.issuedAt
      })
    },
    audit: {
      action: idempotent ? "TICKET_ISSUE_REUSED" : "TICKET_ISSUED",
      registrationId: normalizeOptionalString(registration.registrationId),
      eventId: normalizeOptionalString(registration.eventId || event.eventId),
      participantId: normalizeOptionalString(registration.participantId),
      ticketId: normalizeOptionalString(ticket.ticketId),
      ticketRef: normalizeOptionalString(ticket.ticketRef),
      artifactFormat: normalizeArtifactFormat(format),
      correlationId: normalizeOptionalString(correlationId)
    }
  };
}

function normalizeExistingTicket(ticket) {
  if (!ticket) {
    return null;
  }

  return {
    ticketId: normalizeOptionalString(ticket.ticketId),
    ticketRef: normalizeOptionalString(ticket.ticketRef),
    registrationId: normalizeOptionalString(ticket.registrationId),
    eventId: normalizeOptionalString(ticket.eventId),
    participantId: normalizeOptionalString(ticket.participantId),
    status: normalizeTicketLifecycleStatus(ticket.status),
    artifactFormat: normalizeArtifactFormat(ticket.artifactFormat),
    artifactUrl: normalizeOptionalString(ticket.artifactUrl),
    artifactFilename: normalizeOptionalString(ticket.artifactFilename),
    artifactContentType: normalizeOptionalString(ticket.artifactContentType),
    qrCodeEnabled: ticket.qrCodeEnabled === true,
    qrCode:
      ticket.qrCodeEnabled === true && ticket.qrCode
        ? {
            format: normalizeOptionalString(ticket.qrCode.format) || "OPAQUE_URL",
            path: normalizeOptionalString(ticket.qrCode.path),
            encodedValue: normalizeOptionalString(ticket.qrCode.encodedValue),
            verification: ticket.qrCode.verification
              ? {
                  ticketId: normalizeOptionalString(ticket.qrCode.verification.ticketId),
                  ticketRef: normalizeOptionalString(ticket.qrCode.verification.ticketRef),
                  eventId: normalizeOptionalString(ticket.qrCode.verification.eventId)
                }
              : null
          }
        : null,
    issuedAt: normalizeIsoDate(ticket.issuedAt),
    correlationId: normalizeOptionalString(ticket.correlationId)
  };
}

function buildArtifactUrl({ artifactBaseUrl, ticketId, artifactFormat }) {
  const normalizedBaseUrl = String(artifactBaseUrl || "").replace(/\/+$/, "");
  const extension = normalizeArtifactFormat(artifactFormat) === "PNG" ? "png" : "pdf";
  return `${normalizedBaseUrl}/${encodeURIComponent(ticketId)}.${extension}`;
}

function buildEventShortCode(eventTitle) {
  const normalizedTitle = String(eventTitle || "")
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, " ");
  const compact = normalizedTitle
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.slice(0, 4))
    .join("")
    .slice(0, 8);
  return compact || "EVENT";
}

function buildDateStamp(value) {
  const normalized = normalizeIsoDate(value);
  if (!normalized) {
    return "00000000";
  }
  return normalized.slice(0, 10).replace(/-/g, "");
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
