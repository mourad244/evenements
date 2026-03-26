import { resolveExportCta } from "./organizerExportUi.js";

const PAYMENT_STATUS_META = {
  PENDING: { label: "Pending", tone: "warning" },
  PAID: { label: "Paid", tone: "success" },
  FAILED: { label: "Failed", tone: "danger" },
  CANCELLED: { label: "Cancelled", tone: "neutral" },
  REFUNDED: { label: "Refunded", tone: "info" },
  UNKNOWN: { label: "Unknown", tone: "neutral" }
};

const RECONCILIATION_STATUS_META = {
  NONE: { label: "No issue", tone: "neutral" },
  NEEDS_REVIEW: { label: "Needs review", tone: "warning" },
  IN_PROGRESS: { label: "In progress", tone: "info" },
  RESOLVED: { label: "Resolved", tone: "success" },
  IRRECOVERABLE: { label: "Irrecoverable", tone: "danger" },
  UNKNOWN: { label: "Unknown", tone: "neutral" }
};

const ALLOWED_SORT_BY = new Set(["paidAt", "amountNet", "updatedAt"]);
const ALLOWED_SORT_DIR = new Set(["asc", "desc"]);
const ALLOWED_PAGE_SIZES = new Set([10, 20, 50]);
const MAX_QUERY_LENGTH = 120;

export function normalizePaymentStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return PAYMENT_STATUS_META[normalized] ? normalized : "UNKNOWN";
}

export function normalizeReconciliationStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return RECONCILIATION_STATUS_META[normalized] ? normalized : "UNKNOWN";
}

export function normalizeOrganizerPaymentsFilters(filters = {}) {
  const status = normalizeArrayStatus(filters.status, normalizePaymentStatus, [
    "UNKNOWN"
  ]);
  const reconciliationStatus = normalizeArrayStatus(
    filters.reconciliationStatus,
    normalizeReconciliationStatus,
    ["UNKNOWN"]
  );

  const page = normalizePositiveInt(filters.page, 1);
  const pageSize = normalizePageSize(filters.pageSize, 20);
  const sortBy = ALLOWED_SORT_BY.has(filters.sortBy) ? filters.sortBy : "paidAt";
  const sortDir = ALLOWED_SORT_DIR.has(filters.sortDir) ? filters.sortDir : "desc";
  const dateFrom = normalizeDateIsoOrNull(filters.dateFrom);
  const dateTo = normalizeDateIsoOrNull(filters.dateTo);
  const amountMin = normalizeNumberOrNull(filters.amountMin);
  const amountMax = normalizeNumberOrNull(filters.amountMax);
  const query = String(filters.query || "").trim().slice(0, MAX_QUERY_LENGTH);

  const errors = [];
  if (amountMin !== null && amountMax !== null && amountMin > amountMax) {
    errors.push("INVALID_AMOUNT_RANGE");
  }
  if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
    errors.push("INVALID_DATE_RANGE");
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: {
      status,
      reconciliationStatus,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
      query,
      sortBy,
      sortDir,
      page,
      pageSize
    }
  };
}

export function sanitizeOrganizerPaymentRow(row = {}) {
  const participantDisplay =
    normalizeOptionalString(row.participantDisplay) ||
    maskParticipantDisplay(row.participantEmail || row.participantId || null);

  return {
    paymentTransactionId: normalizeOptionalString(row.paymentTransactionId),
    eventId: normalizeOptionalString(row.eventId),
    eventTitle: normalizeOptionalString(row.eventTitle),
    registrationId: normalizeOptionalString(row.registrationId),
    participantDisplay,
    status: normalizePaymentStatus(row.status),
    reconciliationStatus: normalizeReconciliationStatus(row.reconciliationStatus),
    amountGross: normalizeMoney(row.amountGross),
    amountRefunded: normalizeMoney(row.amountRefunded),
    amountNet: normalizeMoney(row.amountNet),
    currency: normalizeCurrency(row.currency),
    providerName: normalizeOptionalString(row.providerName),
    providerReferenceMasked:
      normalizeOptionalString(row.providerReferenceMasked) ||
      maskProviderReference(row.providerReference || null),
    paidAt: normalizeDateIsoOrNull(row.paidAt),
    updatedAt: normalizeDateIsoOrNull(row.updatedAt)
  };
}

export function mapOrganizerPaymentRowToUi(row = {}, { locale = "en-US" } = {}) {
  const safeRow = sanitizeOrganizerPaymentRow(row);
  const statusMeta = PAYMENT_STATUS_META[safeRow.status] || PAYMENT_STATUS_META.UNKNOWN;
  const reconciliationMeta =
    RECONCILIATION_STATUS_META[safeRow.reconciliationStatus] ||
    RECONCILIATION_STATUS_META.UNKNOWN;

  return {
    ...safeRow,
    statusLabel: statusMeta.label,
    statusTone: statusMeta.tone,
    reconciliationLabel: reconciliationMeta.label,
    reconciliationTone: reconciliationMeta.tone,
    amountGrossFormatted: formatMoney(
      safeRow.amountGross,
      safeRow.currency,
      locale
    ),
    amountRefundedFormatted: formatMoney(
      safeRow.amountRefunded,
      safeRow.currency,
      locale
    ),
    amountNetFormatted: formatMoney(safeRow.amountNet, safeRow.currency, locale)
  };
}

export function buildOrganizerPaymentsViewModel({
  items = [],
  summary = {},
  filters = {},
  pagination = {},
  exportState = null,
  locale = "en-US"
} = {}) {
  const normalizedFilters = normalizeOrganizerPaymentsFilters(filters);
  const rows = (Array.isArray(items) ? items : []).map((row) =>
    mapOrganizerPaymentRowToUi(row, { locale })
  );

  const normalizedSummary = {
    totalGross: normalizeMoney(summary.totalGross),
    totalRefunded: normalizeMoney(summary.totalRefunded),
    totalNet: normalizeMoney(summary.totalNet),
    currency: normalizeCurrency(summary.currency || rows[0]?.currency || "EUR")
  };

  return {
    rows,
    filters: normalizedFilters.data,
    filterErrors: normalizedFilters.errors,
    pagination: {
      page: normalizePositiveInt(pagination.page, 1),
      pageSize: normalizePageSize(pagination.pageSize, 20),
      totalItems: normalizePositiveIntOrZero(pagination.totalItems, rows.length),
      totalPages: normalizePositiveIntOrZero(
        pagination.totalPages,
        rows.length > 0 ? 1 : 0
      )
    },
    summary: {
      ...normalizedSummary,
      totalGrossFormatted: formatMoney(
        normalizedSummary.totalGross,
        normalizedSummary.currency,
        locale
      ),
      totalRefundedFormatted: formatMoney(
        normalizedSummary.totalRefunded,
        normalizedSummary.currency,
        locale
      ),
      totalNetFormatted: formatMoney(
        normalizedSummary.totalNet,
        normalizedSummary.currency,
        locale
      )
    },
    exportCta: exportState ? resolveExportCta(exportState) : null
  };
}

function normalizeArrayStatus(value, normalizeFn, excluded = []) {
  const values = Array.isArray(value)
    ? value
    : value === undefined || value === null
      ? []
      : [value];

  return [...new Set(values.map((item) => normalizeFn(item)).filter((item) => !excluded.includes(item)))];
}

function normalizeMoney(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function normalizeCurrency(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return normalized || "EUR";
}

function normalizePositiveInt(value, fallback) {
  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function normalizePositiveIntOrZero(value, fallback) {
  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
}

function normalizePageSize(value, fallback) {
  const normalized = normalizePositiveInt(value, fallback);
  return ALLOWED_PAGE_SIZES.has(normalized) ? normalized : fallback;
}

function normalizeDateIsoOrNull(value) {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

function normalizeNumberOrNull(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizeOptionalString(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function maskParticipantDisplay(value) {
  const candidate = normalizeOptionalString(value);
  if (!candidate) {
    return null;
  }
  if (candidate.includes("@")) {
    const [local, domain] = candidate.split("@");
    return `${local.slice(0, 2)}***@${domain}`;
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

function formatMoney(amount, currency, locale) {
  const numericAmount = normalizeMoney(amount);
  const normalizedCurrency = normalizeCurrency(currency);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 2
    }).format(numericAmount);
  } catch {
    return `${numericAmount.toFixed(2)} ${normalizedCurrency}`;
  }
}
