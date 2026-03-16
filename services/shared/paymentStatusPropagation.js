const PAYMENT_TO_REGISTRATION_TARGET = {
  PAID: "CONFIRMED",
  FAILED: "CANCELLED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED"
};

const ALLOWED_REGISTRATION_TRANSITIONS = {
  PENDING_PAYMENT: new Set(["CONFIRMED", "CANCELLED"]),
  REFUND_PENDING: new Set(["REFUNDED"]),
  CONFIRMED: new Set(["REFUNDED"]),
  CANCELLED: new Set(),
  REFUNDED: new Set()
};

export function normalizePaymentStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return normalized || "UNKNOWN";
}

export function normalizeRegistrationStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return normalized || "UNKNOWN";
}

export function resolveRegistrationStatusFromPayment({
  paymentStatus,
  registrationStatus
} = {}) {
  const normalizedPaymentStatus = normalizePaymentStatus(paymentStatus);
  const currentRegistrationStatus = normalizeRegistrationStatus(
    registrationStatus
  );

  if (normalizedPaymentStatus === "PENDING") {
    return {
      paymentStatus: normalizedPaymentStatus,
      registrationStatus: currentRegistrationStatus,
      nextRegistrationStatus: currentRegistrationStatus,
      shouldUpdate: false,
      result: "NOOP",
      reason: "PAYMENT_NOT_FINAL"
    };
  }

  const targetRegistrationStatus =
    PAYMENT_TO_REGISTRATION_TARGET[normalizedPaymentStatus];
  if (!targetRegistrationStatus) {
    return {
      paymentStatus: normalizedPaymentStatus,
      registrationStatus: currentRegistrationStatus,
      nextRegistrationStatus: currentRegistrationStatus,
      shouldUpdate: false,
      result: "REJECT",
      reason: "UNSUPPORTED_PAYMENT_STATUS"
    };
  }

  if (currentRegistrationStatus === targetRegistrationStatus) {
    return {
      paymentStatus: normalizedPaymentStatus,
      registrationStatus: currentRegistrationStatus,
      nextRegistrationStatus: currentRegistrationStatus,
      shouldUpdate: false,
      result: "NOOP",
      reason: "ALREADY_IN_TARGET_STATUS"
    };
  }

  const allowedTargets =
    ALLOWED_REGISTRATION_TRANSITIONS[currentRegistrationStatus];
  if (!allowedTargets || !allowedTargets.has(targetRegistrationStatus)) {
    return {
      paymentStatus: normalizedPaymentStatus,
      registrationStatus: currentRegistrationStatus,
      nextRegistrationStatus: currentRegistrationStatus,
      shouldUpdate: false,
      result: "REJECT",
      reason: "REGISTRATION_TRANSITION_NOT_ALLOWED"
    };
  }

  return {
    paymentStatus: normalizedPaymentStatus,
    registrationStatus: currentRegistrationStatus,
    nextRegistrationStatus: targetRegistrationStatus,
    shouldUpdate: true,
    result: "UPDATE",
    reason: "PAYMENT_STATUS_MAPPED"
  };
}

export function buildRegistrationStatusUpdateEvent({
  paymentTransactionId = null,
  registrationId = null,
  paymentStatus,
  registrationStatus,
  correlationId = null
} = {}) {
  const resolution = resolveRegistrationStatusFromPayment({
    paymentStatus,
    registrationStatus
  });

  if (!resolution.shouldUpdate) {
    return null;
  }

  return {
    type: "registration.status.update_requested",
    source: "payment-service",
    registrationId: registrationId || null,
    paymentTransactionId: paymentTransactionId || null,
    paymentStatus: resolution.paymentStatus,
    fromStatus: resolution.registrationStatus,
    toStatus: resolution.nextRegistrationStatus,
    correlationId: correlationId || null
  };
}
