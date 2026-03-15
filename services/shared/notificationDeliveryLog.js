const ALLOWED_NOTIFICATION_STATUSES = new Set([
  "PENDING",
  "SENT",
  "FAILED",
  "SIMULATED"
]);

const ALLOWED_CHANNELS = new Set(["EMAIL", "SMS"]);
const PAGE_SIZES = new Set([10, 20, 50]);

export function normalizeNotificationLogEntry(entry = {}) {
  const status = normalizeNotificationStatus(entry.status);
  const channel = normalizeNotificationChannel(entry.channel);

  return {
    notificationId: normalizeOptionalString(entry.notificationId),
    messageId: normalizeOptionalString(entry.messageId),
    templateId: normalizeOptionalString(entry.templateId),
    channel,
    recipientUserId: normalizeOptionalString(entry.recipientUserId),
    eventId: normalizeOptionalString(entry.eventId),
    registrationId: normalizeOptionalString(entry.registrationId),
    status,
    errorCode: normalizeOptionalString(entry.errorCode),
    errorMessage: normalizeOptionalString(entry.errorMessage),
    providerMessageId: normalizeOptionalString(entry.providerMessageId),
    attemptNumber: normalizePositiveInt(entry.attemptNumber, 1),
    processedAt: normalizeIsoDate(entry.processedAt),
    correlationId: normalizeOptionalString(entry.correlationId)
  };
}

export function createNotificationLogStore({
  initialEntries = [],
  nowFn = () => new Date().toISOString()
} = {}) {
  const entries = initialEntries.map(normalizeNotificationLogEntry);

  return {
    append(entry) {
      const normalized = normalizeNotificationLogEntry({
        ...entry,
        processedAt: entry?.processedAt || nowFn()
      });
      validateNotificationLogEntry(normalized);
      entries.push(normalized);
      return normalized;
    },

    appendFromWorkerResult(result) {
      const notificationLog = result?.data?.notificationLog;
      if (!notificationLog) {
        throw new Error("worker result does not contain notificationLog");
      }
      return this.append(notificationLog);
    },

    list(query = {}) {
      const normalizedQuery = normalizeNotificationLogQuery(query);
      if (!normalizedQuery.ok) {
        return reject(400, "INVALID_FILTERS", {
          errors: normalizedQuery.errors
        });
      }

      const filtered = applyNotificationLogFilters(entries, normalizedQuery.data);
      const sorted = sortEntries(filtered);
      const paginated = paginateRows(
        sorted,
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
            totalItems: filtered.length,
            totalPages: paginated.totalPages
          }
        }
      };
    },

    getSnapshot() {
      return entries.map((entry) => ({ ...entry }));
    }
  };
}

export function normalizeNotificationLogQuery(query = {}) {
  const statusValues = normalizeStatusArray(query.status);
  const channelValues = normalizeChannelArray(query.channel);
  const page = normalizePositiveInt(query.page, 1);
  const pageSize = normalizePageSize(query.pageSize, 20);

  const errors = [];
  if (query.status !== undefined && statusValues.invalidCount > 0) {
    errors.push("INVALID_STATUS_FILTER");
  }
  if (query.channel !== undefined && channelValues.invalidCount > 0) {
    errors.push("INVALID_CHANNEL_FILTER");
  }

  return {
    ok: errors.length === 0,
    errors,
    data: {
      status: statusValues.values,
      channel: channelValues.values,
      eventId: normalizeOptionalString(query.eventId),
      recipientUserId: normalizeOptionalString(query.recipientUserId),
      templateId: normalizeOptionalString(query.templateId),
      page,
      pageSize
    }
  };
}

function validateNotificationLogEntry(entry) {
  if (
    !entry.notificationId ||
    !entry.messageId ||
    !entry.templateId ||
    !entry.recipientUserId ||
    !entry.processedAt ||
    !entry.correlationId
  ) {
    throw new Error("notification log entry is missing required fields");
  }
}

function applyNotificationLogFilters(entries, query) {
  return entries.filter((entry) => {
    if (query.status.length > 0 && !query.status.includes(entry.status)) {
      return false;
    }
    if (query.channel.length > 0 && !query.channel.includes(entry.channel)) {
      return false;
    }
    if (query.eventId && entry.eventId !== query.eventId) {
      return false;
    }
    if (query.recipientUserId && entry.recipientUserId !== query.recipientUserId) {
      return false;
    }
    if (query.templateId && entry.templateId !== query.templateId) {
      return false;
    }
    return true;
  });
}

function sortEntries(entries) {
  return [...entries].sort((left, right) => {
    const leftTime = left.processedAt ? new Date(left.processedAt).getTime() : 0;
    const rightTime = right.processedAt ? new Date(right.processedAt).getTime() : 0;
    return rightTime - leftTime;
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

function normalizeNotificationStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return ALLOWED_NOTIFICATION_STATUSES.has(normalized) ? normalized : "FAILED";
}

function normalizeNotificationChannel(channel) {
  const normalized = String(channel || "").trim().toUpperCase();
  return ALLOWED_CHANNELS.has(normalized) ? normalized : "EMAIL";
}

function normalizeStatusArray(rawValue) {
  return normalizeEnumArray(rawValue, ALLOWED_NOTIFICATION_STATUSES);
}

function normalizeChannelArray(rawValue) {
  return normalizeEnumArray(rawValue, ALLOWED_CHANNELS);
}

function normalizeEnumArray(rawValue, allowedSet) {
  const values = Array.isArray(rawValue)
    ? rawValue
    : rawValue === undefined || rawValue === null
      ? []
      : [rawValue];

  const normalized = [];
  let invalidCount = 0;

  for (const value of values) {
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

function normalizePositiveInt(value, fallback) {
  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : fallback;
}

function normalizePageSize(value, fallback) {
  const numeric = normalizePositiveInt(value, fallback);
  return PAGE_SIZES.has(numeric) ? numeric : fallback;
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
