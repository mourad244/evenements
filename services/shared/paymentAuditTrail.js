const AUDIT_ACTIONS = new Set([
  "PAYMENT_MANUAL_ACTION_APPLIED",
  "PAYMENT_MANUAL_ACTION_REJECTED",
  "PAYMENT_STATUS_UPDATED",
  "PAYMENT_RECONCILIATION_STATUS_UPDATED",
  "REGISTRATION_STATUS_UPDATED_FROM_PAYMENT",
  "TICKET_STATUS_UPDATED_FROM_REGISTRATION",
  "PAYMENT_RECONCILIATION_CASE_ANNOTATED",
  "PAYMENT_RECONCILIATION_RETRY_TRIGGERED",
  "PAYMENT_RECONCILIATION_MARKED_IRRECOVERABLE",
  "PAYMENT_MANUAL_OVERRIDE_APPLIED"
]);

const AUDIT_RESULTS = new Set(["SUCCESS", "REJECTED", "NOOP", "ERROR"]);

export function normalizeAuditAction(action) {
  const normalized = String(action || "").trim().toUpperCase();
  return AUDIT_ACTIONS.has(normalized) ? normalized : "PAYMENT_MANUAL_ACTION_APPLIED";
}

export function normalizeAuditResult(result) {
  const normalized = String(result || "").trim().toUpperCase();
  return AUDIT_RESULTS.has(normalized) ? normalized : "SUCCESS";
}

export function createPaymentAuditEntry({
  action,
  result = "SUCCESS",
  paymentTransactionId = null,
  registrationId = null,
  ticketId = null,
  actorId = null,
  actorRole = "SYSTEM",
  correlationId = null,
  fromStatus = null,
  toStatus = null,
  note = null,
  metadata = {},
  summary = null,
  at = new Date().toISOString()
} = {}) {
  const normalizedAction = normalizeAuditAction(action);
  const normalizedResult = normalizeAuditResult(result);
  const normalizedMetadata = sanitizeMetadata(metadata);
  const normalizedNote = normalizeOptionalString(note);

  return {
    action: normalizedAction,
    result: normalizedResult,
    summary:
      normalizeOptionalString(summary) ||
      buildReadableSummary({
        action: normalizedAction,
        result: normalizedResult,
        paymentTransactionId,
        fromStatus,
        toStatus,
        note: normalizedNote
      }),
    paymentTransactionId: normalizeOptionalString(paymentTransactionId),
    registrationId: normalizeOptionalString(registrationId),
    ticketId: normalizeOptionalString(ticketId),
    actorId: normalizeOptionalString(actorId),
    actorRole: normalizeOptionalString(actorRole) || "SYSTEM",
    correlationId: normalizeOptionalString(correlationId),
    fromStatus: normalizeOptionalString(fromStatus),
    toStatus: normalizeOptionalString(toStatus),
    note: normalizedNote,
    metadata: normalizedMetadata,
    at
  };
}

export function buildManualReconciliationAuditTrail({
  manualAction,
  beforeState = {},
  afterState = {},
  actorId = null,
  actorRole = "ADMIN",
  correlationId = null,
  note = null,
  at = new Date().toISOString()
} = {}) {
  const before = normalizeStateSnapshot(beforeState);
  const after = normalizeStateSnapshot(afterState);
  const manualActionLabel = String(manualAction || "").trim().toUpperCase() || "UNKNOWN";

  const entries = [
    createPaymentAuditEntry({
      action: "PAYMENT_MANUAL_ACTION_APPLIED",
      result: "SUCCESS",
      paymentTransactionId: after.transaction.paymentTransactionId || before.transaction.paymentTransactionId,
      registrationId: after.registration.registrationId || before.registration.registrationId,
      ticketId: after.ticket.ticketId || before.ticket.ticketId,
      actorId,
      actorRole,
      correlationId,
      note,
      metadata: { manualAction: manualActionLabel },
      summary: `Manual reconciliation action ${manualActionLabel} applied.`,
      at
    })
  ];

  if (before.transaction.status !== after.transaction.status) {
    entries.push(
      createPaymentAuditEntry({
        action: "PAYMENT_STATUS_UPDATED",
        result: "SUCCESS",
        paymentTransactionId:
          after.transaction.paymentTransactionId || before.transaction.paymentTransactionId,
        registrationId: after.registration.registrationId || before.registration.registrationId,
        ticketId: after.ticket.ticketId || before.ticket.ticketId,
        actorId,
        actorRole,
        correlationId,
        fromStatus: before.transaction.status,
        toStatus: after.transaction.status,
        note,
        at
      })
    );
  }

  if (
    before.transaction.reconciliationStatus !==
    after.transaction.reconciliationStatus
  ) {
    entries.push(
      createPaymentAuditEntry({
        action: "PAYMENT_RECONCILIATION_STATUS_UPDATED",
        result: "SUCCESS",
        paymentTransactionId:
          after.transaction.paymentTransactionId || before.transaction.paymentTransactionId,
        registrationId: after.registration.registrationId || before.registration.registrationId,
        ticketId: after.ticket.ticketId || before.ticket.ticketId,
        actorId,
        actorRole,
        correlationId,
        fromStatus: before.transaction.reconciliationStatus,
        toStatus: after.transaction.reconciliationStatus,
        note,
        summary: `Reconciliation status changed from ${before.transaction.reconciliationStatus} to ${after.transaction.reconciliationStatus}.`,
        at
      })
    );
  }

  if (before.registration.status !== after.registration.status) {
    entries.push(
      createPaymentAuditEntry({
        action: "REGISTRATION_STATUS_UPDATED_FROM_PAYMENT",
        result: "SUCCESS",
        paymentTransactionId:
          after.transaction.paymentTransactionId || before.transaction.paymentTransactionId,
        registrationId: after.registration.registrationId || before.registration.registrationId,
        ticketId: after.ticket.ticketId || before.ticket.ticketId,
        actorId,
        actorRole,
        correlationId,
        fromStatus: before.registration.status,
        toStatus: after.registration.status,
        note,
        at
      })
    );
  }

  if (before.ticket.status !== after.ticket.status) {
    entries.push(
      createPaymentAuditEntry({
        action: "TICKET_STATUS_UPDATED_FROM_REGISTRATION",
        result: "SUCCESS",
        paymentTransactionId:
          after.transaction.paymentTransactionId || before.transaction.paymentTransactionId,
        registrationId: after.registration.registrationId || before.registration.registrationId,
        ticketId: after.ticket.ticketId || before.ticket.ticketId,
        actorId,
        actorRole,
        correlationId,
        fromStatus: before.ticket.status,
        toStatus: after.ticket.status,
        note,
        at
      })
    );
  }

  return entries;
}

export function appendAuditEntries(
  currentEntries = [],
  newEntries = [],
  { maxEntries = 200 } = {}
) {
  const merged = [
    ...(Array.isArray(currentEntries) ? currentEntries : []),
    ...(Array.isArray(newEntries) ? newEntries.filter(Boolean) : [])
  ];

  const normalizedMaxEntries = Number(maxEntries);
  if (!Number.isFinite(normalizedMaxEntries) || normalizedMaxEntries <= 0) {
    return merged;
  }
  return merged.slice(-Math.floor(normalizedMaxEntries));
}

function normalizeStateSnapshot(state = {}) {
  return {
    transaction: {
      paymentTransactionId: normalizeOptionalString(
        state.transaction?.paymentTransactionId
      ),
      status: normalizeOptionalString(state.transaction?.status) || "UNKNOWN",
      reconciliationStatus:
        normalizeOptionalString(state.transaction?.reconciliationStatus) || "NONE"
    },
    registration: {
      registrationId: normalizeOptionalString(state.registration?.registrationId),
      status: normalizeOptionalString(state.registration?.status) || "UNKNOWN"
    },
    ticket: {
      ticketId: normalizeOptionalString(state.ticket?.ticketId),
      status: normalizeOptionalString(state.ticket?.status) || "UNKNOWN"
    }
  };
}

function sanitizeMetadata(metadata = {}) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  const result = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

function normalizeOptionalString(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function buildReadableSummary({
  action,
  paymentTransactionId,
  fromStatus,
  toStatus,
  note
}) {
  const tx = paymentTransactionId ? ` [tx:${paymentTransactionId}]` : "";
  const from = normalizeOptionalString(fromStatus);
  const to = normalizeOptionalString(toStatus);
  const noteSuffix = note ? ` Note: ${note}` : "";

  if (
    action === "PAYMENT_STATUS_UPDATED" ||
    action === "PAYMENT_RECONCILIATION_STATUS_UPDATED" ||
    action === "REGISTRATION_STATUS_UPDATED_FROM_PAYMENT" ||
    action === "TICKET_STATUS_UPDATED_FROM_REGISTRATION"
  ) {
    return `${action}: ${from || "UNKNOWN"} -> ${to || "UNKNOWN"}${tx}.${noteSuffix}`.trim();
  }

  return `${action}${tx}.${noteSuffix}`.trim();
}
