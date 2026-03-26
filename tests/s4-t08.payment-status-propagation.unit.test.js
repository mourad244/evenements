import assert from "node:assert/strict";
import test from "node:test";

import {
  buildRegistrationStatusUpdateEvent,
  normalizePaymentStatus,
  normalizeRegistrationStatus,
  resolveRegistrationStatusFromPayment
} from "../services/shared/paymentStatusPropagation.js";

test("normalizePaymentStatus uppercases and defaults to UNKNOWN", () => {
  assert.equal(normalizePaymentStatus("paid"), "PAID");
  assert.equal(normalizePaymentStatus(" "), "UNKNOWN");
});

test("normalizeRegistrationStatus uppercases and defaults to UNKNOWN", () => {
  assert.equal(normalizeRegistrationStatus("pending_payment"), "PENDING_PAYMENT");
  assert.equal(normalizeRegistrationStatus(null), "UNKNOWN");
});

test("resolveRegistrationStatusFromPayment maps PAID to CONFIRMED", () => {
  const result = resolveRegistrationStatusFromPayment({
    paymentStatus: "PAID",
    registrationStatus: "PENDING_PAYMENT"
  });

  assert.equal(result.result, "UPDATE");
  assert.equal(result.shouldUpdate, true);
  assert.equal(result.nextRegistrationStatus, "CONFIRMED");
});

test("resolveRegistrationStatusFromPayment maps FAILED to CANCELLED", () => {
  const result = resolveRegistrationStatusFromPayment({
    paymentStatus: "FAILED",
    registrationStatus: "PENDING_PAYMENT"
  });

  assert.equal(result.result, "UPDATE");
  assert.equal(result.nextRegistrationStatus, "CANCELLED");
});

test("resolveRegistrationStatusFromPayment keeps PENDING as NOOP", () => {
  const result = resolveRegistrationStatusFromPayment({
    paymentStatus: "PENDING",
    registrationStatus: "PENDING_PAYMENT"
  });

  assert.equal(result.result, "NOOP");
  assert.equal(result.reason, "PAYMENT_NOT_FINAL");
  assert.equal(result.nextRegistrationStatus, "PENDING_PAYMENT");
});

test("resolveRegistrationStatusFromPayment rejects unsupported payment status", () => {
  const result = resolveRegistrationStatusFromPayment({
    paymentStatus: "AUTHORIZED",
    registrationStatus: "PENDING_PAYMENT"
  });

  assert.equal(result.result, "REJECT");
  assert.equal(result.reason, "UNSUPPORTED_PAYMENT_STATUS");
});

test("resolveRegistrationStatusFromPayment handles dedup when already aligned", () => {
  const result = resolveRegistrationStatusFromPayment({
    paymentStatus: "PAID",
    registrationStatus: "CONFIRMED"
  });

  assert.equal(result.result, "NOOP");
  assert.equal(result.reason, "ALREADY_IN_TARGET_STATUS");
});

test("resolveRegistrationStatusFromPayment maps REFUNDED to REFUNDED from REFUND_PENDING", () => {
  const result = resolveRegistrationStatusFromPayment({
    paymentStatus: "REFUNDED",
    registrationStatus: "REFUND_PENDING"
  });

  assert.equal(result.result, "UPDATE");
  assert.equal(result.nextRegistrationStatus, "REFUNDED");
});

test("resolveRegistrationStatusFromPayment rejects stale PAID for CANCELLED registration", () => {
  const result = resolveRegistrationStatusFromPayment({
    paymentStatus: "PAID",
    registrationStatus: "CANCELLED"
  });

  assert.equal(result.result, "REJECT");
  assert.equal(result.reason, "REGISTRATION_TRANSITION_NOT_ALLOWED");
});

test("buildRegistrationStatusUpdateEvent returns payload when transition is valid", () => {
  const event = buildRegistrationStatusUpdateEvent({
    paymentTransactionId: "pay-1",
    registrationId: "reg-1",
    paymentStatus: "PAID",
    registrationStatus: "PENDING_PAYMENT",
    correlationId: "corr-1"
  });

  assert.equal(event.type, "registration.status.update_requested");
  assert.equal(event.toStatus, "CONFIRMED");
  assert.equal(event.fromStatus, "PENDING_PAYMENT");
  assert.equal(event.paymentTransactionId, "pay-1");
});

test("buildRegistrationStatusUpdateEvent returns null for no-op transitions", () => {
  const event = buildRegistrationStatusUpdateEvent({
    paymentStatus: "PENDING",
    registrationStatus: "PENDING_PAYMENT"
  });

  assert.equal(event, null);
});
