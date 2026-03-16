import {
  buildRegistrationStatusUpdateEvent,
  normalizeRegistrationStatus as normalizeRegistrationStatusFromPayment,
  resolveRegistrationStatusFromPayment
} from "./paymentStatusPropagation.js";
import {
  buildTicketStatusUpdateEvent,
  normalizeTicketStatus as normalizeTicketStatusFromGating,
  resolveTicketStatusFromPaymentRegistration
} from "./paymentTicketGating.js";
import {
  buildManualReconciliationAuditTrail,
  createPaymentAuditEntry
} from "./paymentAuditTrail.js";

const RECONCILIATION_STATUSES = new Set([
  "NONE",
  "NEEDS_REVIEW",
  "IN_PROGRESS",
  "RESOLVED",
  "IRRECOVERABLE"
]);

const RECONCILIATION_ACTIONS = new Set([
  "ANNOTATE_CASE",
  "RETRY_PROVIDER_CHECK",
  "MARK_RESOLVED_PAID",
  "MARK_RESOLVED_FAILED",
  "MARK_IRRECOVERABLE"
]);

export function normalizePaymentStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return normalized || "UNKNOWN";
}

export function normalizeReconciliationStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  if (RECONCILIATION_STATUSES.has(normalized)) {
    return normalized;
  }
  return "NONE";
}

export function normalizeReconciliationAction(action) {
  const normalized = String(action || "").trim().toUpperCase();
  return RECONCILIATION_ACTIONS.has(normalized) ? normalized : "UNKNOWN";
}

export function resolveAvailableReconciliationActions(transaction = {}) {
  const paymentStatus = normalizePaymentStatus(transaction.status);
  const reconciliationStatus = normalizeReconciliationStatus(
    transaction.reconciliationStatus
  );

  const actions = ["ANNOTATE_CASE"];

  if (
    reconciliationStatus !== "RESOLVED" &&
    reconciliationStatus !== "IRRECOVERABLE"
  ) {
    actions.push("MARK_IRRECOVERABLE");
  }

  if (
    reconciliationStatus === "NEEDS_REVIEW" ||
    reconciliationStatus === "IN_PROGRESS"
  ) {
    actions.push("RETRY_PROVIDER_CHECK");
  }

  if (
    paymentStatus === "PENDING" ||
    paymentStatus === "FAILED" ||
    paymentStatus === "CANCELLED"
  ) {
    if (reconciliationStatus !== "IRRECOVERABLE") {
      actions.push("MARK_RESOLVED_PAID", "MARK_RESOLVED_FAILED");
    }
  }

  return {
    paymentStatus,
    reconciliationStatus,
    actions
  };
}

export function applyManualReconciliationAction({
  transaction = {},
  registration = {},
  ticket = {},
  action,
  note = "",
  actorId = null,
  correlationId = null,
  now = new Date().toISOString()
} = {}) {
  const paymentTransaction = normalizeTransaction(transaction);
  const registrationState = normalizeRegistration(registration);
  const ticketState = normalizeTicket(ticket);
  const beforeState = {
    transaction: paymentTransaction,
    registration: registrationState,
    ticket: ticketState
  };
  const normalizedNote = String(note || "").trim();
  const normalizedAction = normalizeReconciliationAction(action);
  if (normalizedAction === "UNKNOWN") {
    return rejectResolution("UNKNOWN_RECONCILIATION_ACTION", {
      audits: [
        createPaymentAuditEntry({
          action: "PAYMENT_MANUAL_ACTION_REJECTED",
          result: "REJECTED",
          paymentTransactionId: paymentTransaction.paymentTransactionId,
          registrationId: registrationState.registrationId,
          ticketId: ticketState.ticketId,
          actorId,
          actorRole: "ADMIN",
          correlationId,
          note: normalizedNote || null,
          metadata: {
            requestedAction: String(action || "").trim() || null
          },
          summary: "Manual reconciliation action rejected: unknown action.",
          at: now
        })
      ]
    });
  }

  const availableActions = resolveAvailableReconciliationActions(transaction);
  if (!availableActions.actions.includes(normalizedAction)) {
    return rejectResolution("ACTION_NOT_ALLOWED", {
      audits: [
        createPaymentAuditEntry({
          action: "PAYMENT_MANUAL_ACTION_REJECTED",
          result: "REJECTED",
          paymentTransactionId: paymentTransaction.paymentTransactionId,
          registrationId: registrationState.registrationId,
          ticketId: ticketState.ticketId,
          actorId,
          actorRole: "ADMIN",
          correlationId,
          note: normalizedNote || null,
          metadata: {
            manualAction: normalizedAction,
            reconciliationStatus: paymentTransaction.reconciliationStatus
          },
          summary: `Manual reconciliation action ${normalizedAction} is not allowed in current state.`,
          at: now
        })
      ]
    });
  }

  if (normalizedAction === "ANNOTATE_CASE") {
    if (!normalizedNote) {
      return rejectResolution("NOTE_REQUIRED", {
        audits: [
          createPaymentAuditEntry({
            action: "PAYMENT_MANUAL_ACTION_REJECTED",
            result: "REJECTED",
            paymentTransactionId: paymentTransaction.paymentTransactionId,
            registrationId: registrationState.registrationId,
            ticketId: ticketState.ticketId,
            actorId,
            actorRole: "ADMIN",
            correlationId,
            metadata: { manualAction: normalizedAction },
            summary: "Manual reconciliation annotation rejected: note is required.",
            at: now
          })
        ]
      });
    }

    const annotation = buildNoteAnnotation({
      note: normalizedNote,
      actorId,
      at: now
    });
    const nextTransaction = {
      ...paymentTransaction,
      reconciliationStatus:
        paymentTransaction.reconciliationStatus === "NONE"
          ? "NEEDS_REVIEW"
          : paymentTransaction.reconciliationStatus,
      manualActionRequired: true,
      reconciliationNotes: [...paymentTransaction.reconciliationNotes, annotation]
    };
    const afterState = {
      transaction: nextTransaction,
      registration: registrationState,
      ticket: ticketState
    };
    const audits = [
      ...buildManualReconciliationAuditTrail({
        manualAction: normalizedAction,
        beforeState,
        afterState,
        actorId,
        actorRole: "ADMIN",
        correlationId,
        note: normalizedNote,
        at: now
      }),
      createPaymentAuditEntry({
        action: "PAYMENT_RECONCILIATION_CASE_ANNOTATED",
        result: "SUCCESS",
        paymentTransactionId: nextTransaction.paymentTransactionId,
        registrationId: registrationState.registrationId,
        ticketId: ticketState.ticketId,
        actorId,
        actorRole: "ADMIN",
        correlationId,
        note: normalizedNote,
        at: now
      })
    ];

    return acceptResolution({
      reason: "CASE_ANNOTATED",
      transaction: nextTransaction,
      registration: registrationState,
      ticket: ticketState,
      events: [
        {
          type: "payment.reconciliation.case_annotated",
          paymentTransactionId: paymentTransaction.paymentTransactionId,
          actorId: actorId || null,
          note: normalizedNote,
          correlationId: correlationId || null
        }
      ],
      audits
    });
  }

  if (normalizedAction === "RETRY_PROVIDER_CHECK") {
    const nextAttempts = Number(paymentTransaction.reconciliationAttempts) + 1;
    const nextTransaction = {
      ...paymentTransaction,
      reconciliationStatus: "IN_PROGRESS",
      manualActionRequired: false,
      reconciliationAttempts: nextAttempts,
      lastReconciliationAttemptAt: now
    };
    const afterState = {
      transaction: nextTransaction,
      registration: registrationState,
      ticket: ticketState
    };
    const audits = [
      ...buildManualReconciliationAuditTrail({
        manualAction: normalizedAction,
        beforeState,
        afterState,
        actorId,
        actorRole: "ADMIN",
        correlationId,
        note: normalizedNote || `Retry attempt ${nextAttempts}`,
        at: now
      }),
      createPaymentAuditEntry({
        action: "PAYMENT_RECONCILIATION_RETRY_TRIGGERED",
        result: "SUCCESS",
        paymentTransactionId: nextTransaction.paymentTransactionId,
        registrationId: registrationState.registrationId,
        ticketId: ticketState.ticketId,
        actorId,
        actorRole: "ADMIN",
        correlationId,
        metadata: { attempt: nextAttempts },
        note: normalizedNote || null,
        at: now
      })
    ];

    return acceptResolution({
      reason: "RETRY_REQUESTED",
      transaction: nextTransaction,
      registration: registrationState,
      ticket: ticketState,
      events: [
        {
          type: "payment.reconciliation.retry_requested",
          paymentTransactionId: paymentTransaction.paymentTransactionId,
          attempt: nextAttempts,
          actorId: actorId || null,
          correlationId: correlationId || null
        }
      ],
      audits
    });
  }

  if (normalizedAction === "MARK_IRRECOVERABLE") {
    if (!normalizedNote) {
      return rejectResolution("NOTE_REQUIRED", {
        audits: [
          createPaymentAuditEntry({
            action: "PAYMENT_MANUAL_ACTION_REJECTED",
            result: "REJECTED",
            paymentTransactionId: paymentTransaction.paymentTransactionId,
            registrationId: registrationState.registrationId,
            ticketId: ticketState.ticketId,
            actorId,
            actorRole: "ADMIN",
            correlationId,
            metadata: { manualAction: normalizedAction },
            summary: "Manual reconciliation irreversible mark rejected: note is required.",
            at: now
          })
        ]
      });
    }

    const nextTransaction = {
      ...paymentTransaction,
      reconciliationStatus: "IRRECOVERABLE",
      manualActionRequired: false,
      lastReconciliationAttemptAt: now,
      resolutionNote: normalizedNote,
      reconciliationNotes: [
        ...paymentTransaction.reconciliationNotes,
        buildNoteAnnotation({
          note: normalizedNote,
          actorId,
          at: now
        })
      ]
    };
    const afterState = {
      transaction: nextTransaction,
      registration: registrationState,
      ticket: ticketState
    };
    const audits = [
      ...buildManualReconciliationAuditTrail({
        manualAction: normalizedAction,
        beforeState,
        afterState,
        actorId,
        actorRole: "ADMIN",
        correlationId,
        note: normalizedNote,
        at: now
      }),
      createPaymentAuditEntry({
        action: "PAYMENT_RECONCILIATION_MARKED_IRRECOVERABLE",
        result: "SUCCESS",
        paymentTransactionId: nextTransaction.paymentTransactionId,
        registrationId: registrationState.registrationId,
        ticketId: ticketState.ticketId,
        actorId,
        actorRole: "ADMIN",
        correlationId,
        note: normalizedNote,
        at: now
      })
    ];

    return acceptResolution({
      reason: "MARKED_IRRECOVERABLE",
      transaction: nextTransaction,
      registration: registrationState,
      ticket: ticketState,
      events: [
        {
          type: "payment.reconciliation.irrecoverable_marked",
          paymentTransactionId: paymentTransaction.paymentTransactionId,
          actorId: actorId || null,
          note: normalizedNote,
          correlationId: correlationId || null
        }
      ],
      audits
    });
  }

  const targetPaymentStatus =
    normalizedAction === "MARK_RESOLVED_PAID" ? "PAID" : "FAILED";
  return resolveWithPaymentStatus({
    manualAction: normalizedAction,
    paymentTransaction,
    registrationState,
    ticketState,
    targetPaymentStatus,
    note: normalizedNote,
    actorId,
    correlationId,
    now
  });
}

function resolveWithPaymentStatus({
  manualAction,
  paymentTransaction,
  registrationState,
  ticketState,
  targetPaymentStatus,
  note,
  actorId,
  correlationId,
  now
}) {
  const registrationResolution = resolveRegistrationStatusFromPayment({
    paymentStatus: targetPaymentStatus,
    registrationStatus: registrationState.status
  });

  if (registrationResolution.result === "REJECT") {
    return rejectResolution("REGISTRATION_PROPAGATION_REJECTED", {
      detail: registrationResolution.reason,
      audits: [
        createPaymentAuditEntry({
          action: "PAYMENT_MANUAL_ACTION_REJECTED",
          result: "REJECTED",
          paymentTransactionId: paymentTransaction.paymentTransactionId,
          registrationId: registrationState.registrationId,
          ticketId: ticketState.ticketId,
          actorId,
          actorRole: "ADMIN",
          correlationId,
          metadata: {
            manualAction,
            targetPaymentStatus,
            rejection: registrationResolution.reason
          },
          summary: "Manual reconciliation rejected during registration propagation.",
          at: now
        })
      ]
    });
  }

  const nextRegistrationStatus = registrationResolution.nextRegistrationStatus;
  const ticketResolution = resolveTicketStatusFromPaymentRegistration({
    paymentStatus: targetPaymentStatus,
    registrationStatus: nextRegistrationStatus,
    ticketStatus: ticketState.status
  });

  if (ticketResolution.result === "REJECT") {
    return rejectResolution("TICKET_PROPAGATION_REJECTED", {
      detail: ticketResolution.reason,
      audits: [
        createPaymentAuditEntry({
          action: "PAYMENT_MANUAL_ACTION_REJECTED",
          result: "REJECTED",
          paymentTransactionId: paymentTransaction.paymentTransactionId,
          registrationId: registrationState.registrationId,
          ticketId: ticketState.ticketId,
          actorId,
          actorRole: "ADMIN",
          correlationId,
          metadata: {
            manualAction,
            targetPaymentStatus,
            rejection: ticketResolution.reason
          },
          summary: "Manual reconciliation rejected during ticket propagation.",
          at: now
        })
      ]
    });
  }

  const nextTransaction = {
    ...paymentTransaction,
    status: targetPaymentStatus,
    reconciliationStatus: "RESOLVED",
    manualActionRequired: false,
    lastReconciliationAttemptAt: now,
    resolutionNote: note || `MANUAL_RESOLUTION_${targetPaymentStatus}`
  };

  const nextRegistration = {
    ...registrationState,
    status: nextRegistrationStatus
  };

  const nextTicket = {
    ...ticketState,
    status: ticketResolution.nextTicketStatus
  };
  const audits = [
    ...buildManualReconciliationAuditTrail({
      manualAction,
      beforeState: {
        transaction: paymentTransaction,
        registration: registrationState,
        ticket: ticketState
      },
      afterState: {
        transaction: nextTransaction,
        registration: nextRegistration,
        ticket: nextTicket
      },
      actorId,
      actorRole: "ADMIN",
      correlationId,
      note,
      at: now
    }),
    createPaymentAuditEntry({
      action: "PAYMENT_MANUAL_OVERRIDE_APPLIED",
      result: "SUCCESS",
      paymentTransactionId: paymentTransaction.paymentTransactionId,
      registrationId: registrationState.registrationId,
      ticketId: ticketState.ticketId,
      actorId,
      actorRole: "ADMIN",
      correlationId,
      fromStatus: paymentTransaction.status,
      toStatus: targetPaymentStatus,
      note,
      at: now
    })
  ];

  const events = [
    {
      type: "payment.reconciliation.resolved",
      paymentTransactionId: paymentTransaction.paymentTransactionId,
      fromStatus: paymentTransaction.status,
      toStatus: targetPaymentStatus,
      actorId: actorId || null,
      correlationId: correlationId || null
    }
  ];

  const registrationEvent = buildRegistrationStatusUpdateEvent({
    paymentTransactionId: paymentTransaction.paymentTransactionId,
    registrationId: registrationState.registrationId,
    paymentStatus: targetPaymentStatus,
    registrationStatus: registrationState.status,
    correlationId
  });
  if (registrationEvent) {
    events.push(registrationEvent);
  }

  const ticketEvent = buildTicketStatusUpdateEvent({
    ticketId: ticketState.ticketId,
    registrationId: registrationState.registrationId,
    paymentTransactionId: paymentTransaction.paymentTransactionId,
    paymentStatus: targetPaymentStatus,
    registrationStatus: nextRegistrationStatus,
    ticketStatus: ticketState.status,
    correlationId
  });
  if (ticketEvent) {
    events.push(ticketEvent);
  }

  return acceptResolution({
    reason: "CASE_RESOLVED_MANUALLY",
    transaction: nextTransaction,
    registration: nextRegistration,
    ticket: nextTicket,
    events,
    audits
  });
}

function normalizeTransaction(transaction = {}) {
  return {
    paymentTransactionId: transaction.paymentTransactionId || null,
    status: normalizePaymentStatus(transaction.status),
    reconciliationStatus: normalizeReconciliationStatus(
      transaction.reconciliationStatus
    ),
    reconciliationAttempts: Number(transaction.reconciliationAttempts || 0),
    lastReconciliationAttemptAt: transaction.lastReconciliationAttemptAt || null,
    manualActionRequired: transaction.manualActionRequired === true,
    reconciliationNotes: Array.isArray(transaction.reconciliationNotes)
      ? [...transaction.reconciliationNotes]
      : [],
    resolutionNote: transaction.resolutionNote || null
  };
}

function normalizeRegistration(registration = {}) {
  return {
    registrationId: registration.registrationId || null,
    status: normalizeRegistrationStatusFromPayment(
      registration.status || registration.registrationStatus
    )
  };
}

function normalizeTicket(ticket = {}) {
  return {
    ticketId: ticket.ticketId || null,
    status: normalizeTicketStatusFromGating(ticket.status || ticket.ticketStatus)
  };
}

function buildNoteAnnotation({
  note,
  actorId,
  at
}) {
  return {
    note,
    actorId: actorId || null,
    at
  };
}

function rejectResolution(reason, extra = {}) {
  return {
    ok: false,
    result: "REJECT",
    reason,
    ...extra
  };
}

function acceptResolution({
  reason,
  transaction,
  registration,
  ticket,
  events = [],
  audits = []
}) {
  return {
    ok: true,
    result: "APPLIED",
    reason,
    transaction,
    registration,
    ticket,
    events,
    audits
  };
}
