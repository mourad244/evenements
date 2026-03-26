const ALLOWED_TICKET_TRANSITIONS = {
  NOT_ISSUED: new Set(["ISSUED", "VOIDED"]),
  ISSUED: new Set(["VOIDED"]),
  VOIDED: new Set()
};

export function normalizePaymentStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return normalized || "UNKNOWN";
}

export function normalizeRegistrationStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return normalized || "UNKNOWN";
}

export function normalizeTicketStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return normalized || "NOT_ISSUED";
}

export function resolveTicketStatusFromPaymentRegistration({
  paymentStatus,
  registrationStatus,
  ticketStatus
} = {}) {
  const normalizedPaymentStatus = normalizePaymentStatus(paymentStatus);
  const normalizedRegistrationStatus = normalizeRegistrationStatus(
    registrationStatus
  );
  const currentTicketStatus = normalizeTicketStatus(ticketStatus);

  const target = deriveTicketTargetStatus({
    paymentStatus: normalizedPaymentStatus,
    registrationStatus: normalizedRegistrationStatus,
    ticketStatus: currentTicketStatus
  });

  if (target.result === "REJECT") {
    return {
      paymentStatus: normalizedPaymentStatus,
      registrationStatus: normalizedRegistrationStatus,
      ticketStatus: currentTicketStatus,
      nextTicketStatus: currentTicketStatus,
      shouldUpdate: false,
      result: "REJECT",
      reason: target.reason
    };
  }

  if (currentTicketStatus === target.nextTicketStatus) {
    return {
      paymentStatus: normalizedPaymentStatus,
      registrationStatus: normalizedRegistrationStatus,
      ticketStatus: currentTicketStatus,
      nextTicketStatus: currentTicketStatus,
      shouldUpdate: false,
      result: "NOOP",
      reason: target.reason
    };
  }

  const allowedTargets = ALLOWED_TICKET_TRANSITIONS[currentTicketStatus];
  if (!allowedTargets || !allowedTargets.has(target.nextTicketStatus)) {
    return {
      paymentStatus: normalizedPaymentStatus,
      registrationStatus: normalizedRegistrationStatus,
      ticketStatus: currentTicketStatus,
      nextTicketStatus: currentTicketStatus,
      shouldUpdate: false,
      result: "REJECT",
      reason: "TICKET_TRANSITION_NOT_ALLOWED"
    };
  }

  return {
    paymentStatus: normalizedPaymentStatus,
    registrationStatus: normalizedRegistrationStatus,
    ticketStatus: currentTicketStatus,
    nextTicketStatus: target.nextTicketStatus,
    shouldUpdate: true,
    result: "UPDATE",
    reason: target.reason
  };
}

export function buildTicketStatusUpdateEvent({
  ticketId = null,
  registrationId = null,
  paymentTransactionId = null,
  paymentStatus,
  registrationStatus,
  ticketStatus,
  correlationId = null
} = {}) {
  const resolution = resolveTicketStatusFromPaymentRegistration({
    paymentStatus,
    registrationStatus,
    ticketStatus
  });

  if (!resolution.shouldUpdate) {
    return null;
  }

  return {
    type: "ticket.status.update_requested",
    source: "ticketing-service",
    ticketId: ticketId || null,
    registrationId: registrationId || null,
    paymentTransactionId: paymentTransactionId || null,
    paymentStatus: resolution.paymentStatus,
    registrationStatus: resolution.registrationStatus,
    fromStatus: resolution.ticketStatus,
    toStatus: resolution.nextTicketStatus,
    reason: resolution.reason,
    correlationId: correlationId || null
  };
}

function deriveTicketTargetStatus({
  paymentStatus,
  registrationStatus,
  ticketStatus
}) {
  if (registrationStatus === "CONFIRMED") {
    if (paymentStatus === "PAID") {
      return {
        result: "NEXT",
        nextTicketStatus: "ISSUED",
        reason: "ELIGIBLE_FOR_ISSUANCE"
      };
    }

    if (ticketStatus === "ISSUED") {
      return {
        result: "NEXT",
        nextTicketStatus: "VOIDED",
        reason: "PAYMENT_INVARIANT_BROKEN"
      };
    }

    return {
      result: "NEXT",
      nextTicketStatus: "NOT_ISSUED",
      reason: "PAYMENT_NOT_CONFIRMED"
    };
  }

  if (registrationStatus === "PENDING_PAYMENT") {
    if (ticketStatus === "ISSUED") {
      return {
        result: "NEXT",
        nextTicketStatus: "VOIDED",
        reason: "PENDING_PAYMENT_CANNOT_KEEP_ISSUED"
      };
    }

    return {
      result: "NEXT",
      nextTicketStatus: "NOT_ISSUED",
      reason: "WAITING_FOR_PAYMENT"
    };
  }

  if (registrationStatus === "REFUND_PENDING") {
    return {
      result: "NEXT",
      nextTicketStatus: ticketStatus === "ISSUED" ? "VOIDED" : "NOT_ISSUED",
      reason: "REFUND_PENDING"
    };
  }

  if (registrationStatus === "CANCELLED") {
    return {
      result: "NEXT",
      nextTicketStatus: ticketStatus === "ISSUED" ? "VOIDED" : "NOT_ISSUED",
      reason: "REGISTRATION_CANCELLED"
    };
  }

  if (registrationStatus === "REFUNDED") {
    return {
      result: "NEXT",
      nextTicketStatus: "VOIDED",
      reason: "REGISTRATION_REFUNDED"
    };
  }

  return {
    result: "REJECT",
    reason: "UNSUPPORTED_REGISTRATION_STATUS"
  };
}
