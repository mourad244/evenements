const PAYMENT_STATUSES = new Set([
  "PENDING",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED"
]);

const RECONCILIATION_STATUSES = new Set([
  "NONE",
  "NEEDS_REVIEW",
  "IN_PROGRESS",
  "RESOLVED",
  "IRRECOVERABLE"
]);

const SORT_FIELDS = new Set(["PAIDAT", "AMOUNTNET", "UPDATEDAT"]);
const SORT_DIRECTIONS = new Set(["ASC", "DESC"]);
const PAGE_SIZES = new Set([10, 20, 50]);

export function normalizeOrganizerPaymentsQuery(query = {}) {
  const statusValues = normalizeStatusArray(query.status, PAYMENT_STATUSES);
  const reconciliationValues = normalizeStatusArray(
    query.reconciliationStatus,
    RECONCILIATION_STATUSES
  );

  const page = normalizePositiveInt(query.page, 1);
  const pageSize = normalizePageSize(query.pageSize, 20);
  const sortBy = normalizeSortField(query.sortBy, "PAIDAT");
  const sortDir = normalizeSortDirection(query.sortDir, "DESC");
  const amountMin = normalizeAmount(query.amountMin);
  const amountMax = normalizeAmount(query.amountMax);
  const dateFrom = normalizeDateOrNull(query.dateFrom);
  const dateTo = normalizeDateOrNull(query.dateTo);
  const searchQuery = String(query.query || "").trim().toLowerCase();

  const errors = [];
  if (query.status !== undefined && statusValues.invalidCount > 0) {
    errors.push("INVALID_STATUS_FILTER");
  }
  if (
    query.reconciliationStatus !== undefined &&
    reconciliationValues.invalidCount > 0
  ) {
    errors.push("INVALID_RECONCILIATION_STATUS_FILTER");
  }
  if (amountMin !== null && amountMax !== null && amountMin > amountMax) {
    errors.push("INVALID_AMOUNT_RANGE");
  }
  if (dateFrom && dateTo && dateFrom > dateTo) {
    errors.push("INVALID_DATE_RANGE");
  }

  return {
    ok: errors.length === 0,
    errors,
    data: {
      status: statusValues.values,
      reconciliationStatus: reconciliationValues.values,
      page,
      pageSize,
      sortBy,
      sortDir,
      amountMin,
      amountMax,
      dateFrom,
      dateTo,
      query: searchQuery
    }
  };
}

export function canAccessOrganizerEvent({
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

export function mapOrganizerPaymentRow(payment = {}) {
  const participantDisplay =
    payment.participantDisplay ||
    maskParticipant(payment.participantEmail || payment.participantId || null);

  return {
    paymentTransactionId: normalizeOptionalString(payment.paymentTransactionId),
    eventId: normalizeOptionalString(payment.eventId),
    eventTitle: normalizeOptionalString(payment.eventTitle),
    registrationId: normalizeOptionalString(payment.registrationId),
    participantDisplay,
    status: normalizePaymentStatus(payment.status),
    reconciliationStatus: normalizeReconciliationStatus(
      payment.reconciliationStatus
    ),
    amountGross: normalizeAmountForRow(payment.amountGross),
    amountRefunded: normalizeAmountForRow(payment.amountRefunded),
    amountNet: normalizeAmountForRow(payment.amountNet),
    currency: normalizeCurrency(payment.currency),
    providerName: normalizeOptionalString(payment.providerName),
    providerReferenceMasked: maskProviderReference(payment.providerReference),
    paidAt: normalizeDateIsoString(payment.paidAt),
    updatedAt: normalizeDateIsoString(payment.updatedAt)
  };
}

export function buildOrganizerPaymentsListResponse({
  payments = [],
  eventId,
  actor = {},
  eventOwnerOrganizerId,
  query = {},
  correlationId = null
} = {}) {
  const normalizedRole = String(actor.role || "").trim().toUpperCase();
  if (!normalizedRole) {
    return reject(401, "UNAUTHENTICATED");
  }

  const allowed = canAccessOrganizerEvent({
    actorRole: normalizedRole,
    actorOrganizerId: actor.organizerId,
    eventOwnerOrganizerId
  });
  if (!allowed) {
    return reject(403, "FORBIDDEN_SCOPE");
  }

  const normalizedQuery = normalizeOrganizerPaymentsQuery(query);
  if (!normalizedQuery.ok) {
    return reject(400, "INVALID_FILTERS", {
      errors: normalizedQuery.errors
    });
  }

  const mappedRows = payments
    .filter((payment) => String(payment.eventId || "") === String(eventId || ""))
    .map(mapOrganizerPaymentRow);

  const filteredRows = applyOrganizerPaymentsFilters(
    mappedRows,
    normalizedQuery.data
  );
  const sortedRows = sortOrganizerPayments(filteredRows, normalizedQuery.data);
  const paginated = paginateRows(
    sortedRows,
    normalizedQuery.data.page,
    normalizedQuery.data.pageSize
  );

  return {
    ok: true,
    statusCode: 200,
    data: {
      items: paginated.items,
      pagination: {
        page: normalizedQuery.data.page,
        pageSize: normalizedQuery.data.pageSize,
        totalItems: filteredRows.length,
        totalPages: paginated.totalPages
      },
      summary: summarizePayments(filteredRows),
      correlationId: normalizeOptionalString(correlationId)
    },
    audit: {
      action: "PAYMENT_ORGANIZER_VIEW_ACCESSED",
      eventId: normalizeOptionalString(eventId),
      organizerId: normalizeOptionalString(actor.organizerId),
      role: normalizedRole,
      resultCount: filteredRows.length,
      correlationId: normalizeOptionalString(correlationId)
    }
  };
}

export function buildOrganizerPaymentsExportRequest({
  eventId,
  actor = {},
  eventOwnerOrganizerId,
  filters = {},
  format = "csv",
  correlationId = null,
  now = new Date().toISOString()
} = {}) {
  const normalizedRole = String(actor.role || "").trim().toUpperCase();
  if (!normalizedRole) {
    return reject(401, "UNAUTHENTICATED");
  }

  const allowed = canAccessOrganizerEvent({
    actorRole: normalizedRole,
    actorOrganizerId: actor.organizerId,
    eventOwnerOrganizerId
  });
  if (!allowed) {
    return reject(403, "FORBIDDEN_SCOPE");
  }

  const normalizedFilters = normalizeOrganizerPaymentsQuery(filters);
  if (!normalizedFilters.ok) {
    return reject(400, "INVALID_FILTERS", {
      errors: normalizedFilters.errors
    });
  }

  const normalizedFormat = String(format || "").trim().toLowerCase();
  if (normalizedFormat !== "csv") {
    return reject(400, "UNSUPPORTED_EXPORT_FORMAT");
  }

  const exportId = buildExportId(eventId, now);
  return {
    ok: true,
    statusCode: 202,
    data: {
      exportId,
      status: "RUNNING",
      downloadUrl: null,
      format: "csv",
      filters: normalizedFilters.data
    },
    audit: {
      action: "PAYMENT_ORGANIZER_EXPORT_REQUESTED",
      eventId: normalizeOptionalString(eventId),
      organizerId: normalizeOptionalString(actor.organizerId),
      role: normalizedRole,
      exportId,
      correlationId: normalizeOptionalString(correlationId)
    }
  };
}

function applyOrganizerPaymentsFilters(rows, query) {
  return rows.filter((row) => {
    if (query.status.length > 0 && !query.status.includes(row.status)) {
      return false;
    }
    if (
      query.reconciliationStatus.length > 0 &&
      !query.reconciliationStatus.includes(row.reconciliationStatus)
    ) {
      return false;
    }
    if (query.amountMin !== null && row.amountNet < query.amountMin) {
      return false;
    }
    if (query.amountMax !== null && row.amountNet > query.amountMax) {
      return false;
    }
    if (query.dateFrom && row.paidAt && new Date(row.paidAt) < query.dateFrom) {
      return false;
    }
    if (query.dateTo && row.paidAt && new Date(row.paidAt) > query.dateTo) {
      return false;
    }
    if (query.query) {
      const haystack = [
        row.paymentTransactionId,
        row.registrationId,
        row.participantDisplay
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query.query)) {
        return false;
      }
    }
    return true;
  });
}

function sortOrganizerPayments(rows, query) {
  const direction = query.sortDir === "ASC" ? 1 : -1;
  const sortField = query.sortBy;
  const sorted = [...rows];

  sorted.sort((left, right) => {
    const leftValue = readSortValue(left, sortField);
    const rightValue = readSortValue(right, sortField);
    if (leftValue < rightValue) return -1 * direction;
    if (leftValue > rightValue) return 1 * direction;
    return 0;
  });

  return sorted;
}

function readSortValue(row, sortField) {
  if (sortField === "AMOUNTNET") {
    return Number(row.amountNet || 0);
  }
  if (sortField === "UPDATEDAT") {
    return row.updatedAt ? new Date(row.updatedAt).getTime() : 0;
  }
  return row.paidAt ? new Date(row.paidAt).getTime() : 0;
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

function summarizePayments(rows) {
  const summary = rows.reduce(
    (acc, row) => {
      acc.totalGross += Number(row.amountGross || 0);
      acc.totalRefunded += Number(row.amountRefunded || 0);
      acc.totalNet += Number(row.amountNet || 0);
      if (!acc.currency && row.currency) {
        acc.currency = row.currency;
      }
      return acc;
    },
    {
      totalGross: 0,
      totalRefunded: 0,
      totalNet: 0,
      currency: null
    }
  );
  return summary;
}

function normalizeStatusArray(rawValue, allowedSet) {
  const arrayValue = Array.isArray(rawValue)
    ? rawValue
    : rawValue === undefined || rawValue === null
      ? []
      : [rawValue];

  const normalized = [];
  let invalidCount = 0;

  for (const value of arrayValue) {
    const candidate = String(value || "").trim().toUpperCase();
    if (!candidate) continue;
    if (allowedSet.has(candidate)) {
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

function normalizeSortField(value, fallback) {
  const candidate = String(value || "").trim().toUpperCase();
  return SORT_FIELDS.has(candidate) ? candidate : fallback;
}

function normalizeSortDirection(value, fallback) {
  const candidate = String(value || "").trim().toUpperCase();
  return SORT_DIRECTIONS.has(candidate) ? candidate : fallback;
}

function normalizePositiveInt(value, fallback) {
  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function normalizePageSize(value, fallback) {
  const numeric = normalizePositiveInt(value, fallback);
  return PAGE_SIZES.has(numeric) ? numeric : fallback;
}

function normalizeAmount(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  return numeric;
}

function normalizeAmountForRow(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function normalizeDateOrNull(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function normalizeDateIsoString(value) {
  const parsed = normalizeDateOrNull(value);
  return parsed ? parsed.toISOString() : null;
}

function normalizeCurrency(value) {
  const candidate = String(value || "").trim().toUpperCase();
  return candidate || "EUR";
}

function normalizePaymentStatus(value) {
  const candidate = String(value || "").trim().toUpperCase();
  return PAYMENT_STATUSES.has(candidate) ? candidate : "PENDING";
}

function normalizeReconciliationStatus(value) {
  const candidate = String(value || "").trim().toUpperCase();
  return RECONCILIATION_STATUSES.has(candidate) ? candidate : "NONE";
}

function maskParticipant(value) {
  const candidate = normalizeOptionalString(value);
  if (!candidate) {
    return null;
  }
  if (candidate.includes("@")) {
    const [localPart, domain] = candidate.split("@");
    const first = localPart.slice(0, 2);
    return `${first}***@${domain}`;
  }
  if (candidate.length <= 4) {
    return `${candidate[0] || "*"}***`;
  }
  return `${candidate.slice(0, 2)}***${candidate.slice(-2)}`;
}

function maskProviderReference(value) {
  const candidate = normalizeOptionalString(value);
  if (!candidate) {
    return null;
  }
  if (candidate.length <= 6) {
    return `${candidate.slice(0, 2)}***`;
  }
  return `${candidate.slice(0, 3)}***${candidate.slice(-3)}`;
}

function normalizeOptionalString(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function buildExportId(eventId, nowIso) {
  const safeEventId = String(eventId || "event").replace(/[^a-zA-Z0-9_-]/g, "");
  const stamp = String(nowIso || "").replace(/[^0-9]/g, "").slice(0, 14);
  return `exp_${safeEventId || "event"}_${stamp || "0"}`;
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
