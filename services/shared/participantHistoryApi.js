const ALLOWED_PARTICIPATION_STATUSES = new Set([
  "CONFIRMED",
  "WAITLISTED",
  "CANCELLED",
  "REJECTED"
]);

const PAGE_SIZES = new Set([10, 20, 50]);

export function normalizeParticipantHistoryQuery(query = {}) {
  const statusValues = normalizeStatusArray(query.status);
  const page = normalizePositiveInt(query.page, 1);
  const pageSize = normalizePageSize(query.pageSize, 20);

  const errors = [];
  if (query.status !== undefined && statusValues.invalidCount > 0) {
    errors.push("INVALID_STATUS_FILTER");
  }

  return {
    ok: errors.length === 0,
    errors,
    data: {
      status: statusValues.values,
      page,
      pageSize
    }
  };
}

export function mapParticipationView(registration = {}) {
  const eventStatus = normalizeOptionalString(registration.eventStatus);
  const registrationStatus = normalizeStatus(registration.registrationStatus);
  const ticketId = normalizeOptionalString(registration.ticketId);
  const canDownloadTicket =
    registrationStatus === "CONFIRMED" &&
    registration.canDownloadTicket === true &&
    ticketId !== null;

  return {
    registrationId: normalizeOptionalString(registration.registrationId),
    eventId: normalizeOptionalString(registration.eventId),
    eventTitle: normalizeOptionalString(registration.eventTitle),
    eventStartAt: normalizeIsoDate(registration.eventStartAt),
    eventCity: normalizeOptionalString(registration.eventCity),
    eventStatus,
    registrationStatus,
    waitlistPosition: normalizeNullableInteger(registration.waitlistPosition),
    canDownloadTicket,
    ticketId: canDownloadTicket ? ticketId : null,
    ticketFormat: canDownloadTicket
      ? normalizeOptionalString(registration.ticketFormat) || "PDF"
      : null,
    updatedAt: normalizeIsoDate(registration.updatedAt),
    participantId: normalizeOptionalString(registration.participantId)
  };
}

export function buildParticipantHistoryResponse({
  registrations = [],
  actor = {},
  query = {},
  correlationId = null
} = {}) {
  const role = String(actor.role || "").trim().toUpperCase();
  const participantId = normalizeOptionalString(
    actor.participantId || actor.userId || actor.id
  );

  if (!role) {
    return reject(401, "UNAUTHENTICATED");
  }
  if (role !== "PARTICIPANT") {
    return reject(403, "FORBIDDEN_ROLE");
  }
  if (!participantId) {
    return reject(403, "MISSING_PARTICIPANT_SCOPE");
  }

  const normalizedQuery = normalizeParticipantHistoryQuery(query);
  if (!normalizedQuery.ok) {
    return reject(400, "INVALID_FILTERS", {
      errors: normalizedQuery.errors
    });
  }

  const scopedRows = registrations
    .map(mapParticipationView)
    .filter((row) => row.participantId === participantId);
  const filteredRows = applyParticipantHistoryFilters(
    scopedRows,
    normalizedQuery.data
  );
  const sortedRows = sortRows(filteredRows);
  const paginated = paginateRows(
    sortedRows,
    normalizedQuery.data.page,
    normalizedQuery.data.pageSize
  );

  return {
    ok: true,
    statusCode: 200,
    data: {
      items: paginated.items.map(stripParticipantId),
      pagination: {
        page: normalizedQuery.data.page,
        pageSize: normalizedQuery.data.pageSize,
        totalItems: filteredRows.length,
        totalPages: paginated.totalPages
      },
      correlationId: normalizeOptionalString(correlationId)
    },
    audit: {
      action: "PARTICIPATION_HISTORY_VIEWED",
      participantId,
      role,
      resultCount: filteredRows.length,
      correlationId: normalizeOptionalString(correlationId)
    }
  };
}

function applyParticipantHistoryFilters(rows, query) {
  return rows.filter((row) => {
    if (query.status.length > 0 && !query.status.includes(row.registrationStatus)) {
      return false;
    }
    return true;
  });
}

function sortRows(rows) {
  return [...rows].sort((left, right) => {
    const leftValue = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
    const rightValue = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
    return rightValue - leftValue;
  });
}

function paginateRows(rows, page, pageSize) {
  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const offset = (page - 1) * pageSize;
  return {
    items: rows.slice(offset, offset + pageSize),
    totalPages
  };
}

function stripParticipantId(row) {
  const { participantId, ...publicRow } = row;
  return publicRow;
}

function normalizeStatusArray(rawValue) {
  const values = Array.isArray(rawValue)
    ? rawValue
    : rawValue === undefined || rawValue === null
      ? []
      : [rawValue];

  const normalized = [];
  let invalidCount = 0;

  for (const value of values) {
    const candidate = normalizeStatus(value);
    if (!candidate) {
      continue;
    }
    if (ALLOWED_PARTICIPATION_STATUSES.has(candidate)) {
      normalized.push(candidate);
    } else {
      invalidCount += 1;
    }
  }

  return {
    values: [...new Set(normalized)],
    invalidCount
  };
}

function normalizeStatus(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return normalized || null;
}

function normalizePositiveInt(value, fallback) {
  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function normalizePageSize(value, fallback) {
  const numeric = normalizePositiveInt(value, fallback);
  return PAGE_SIZES.has(numeric) ? numeric : fallback;
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
