import assert from "node:assert/strict";
import test from "node:test";

import {
  buildTicketStatusUpdateEvent,
  normalizeTicketStatus,
  resolveTicketStatusFromPaymentRegistration
} from "../services/shared/paymentTicketGating.js";

test("normalizeTicketStatus uppercases and defaults to NOT_ISSUED", () => {
  assert.equal(normalizeTicketStatus("issued"), "ISSUED");
  assert.equal(normalizeTicketStatus(" "), "NOT_ISSUED");
});

test("resolveTicketStatusFromPaymentRegistration issues ticket for confirmed + paid", () => {
  const result = resolveTicketStatusFromPaymentRegistration({
    paymentStatus: "PAID",
    registrationStatus: "CONFIRMED",
    ticketStatus: "NOT_ISSUED"
  });

  assert.equal(result.result, "UPDATE");
  assert.equal(result.nextTicketStatus, "ISSUED");
  assert.equal(result.reason, "ELIGIBLE_FOR_ISSUANCE");
});

test("resolveTicketStatusFromPaymentRegistration blocks issuance when payment is pending", () => {
  const result = resolveTicketStatusFromPaymentRegistration({
    paymentStatus: "PENDING",
    registrationStatus: "CONFIRMED",
    ticketStatus: "NOT_ISSUED"
  });

  assert.equal(result.result, "NOOP");
  assert.equal(result.nextTicketStatus, "NOT_ISSUED");
  assert.equal(result.reason, "PAYMENT_NOT_CONFIRMED");
});

test("resolveTicketStatusFromPaymentRegistration voids issued ticket when registration is cancelled", () => {
  const result = resolveTicketStatusFromPaymentRegistration({
    paymentStatus: "FAILED",
    registrationStatus: "CANCELLED",
    ticketStatus: "ISSUED"
  });

  assert.equal(result.result, "UPDATE");
  assert.equal(result.nextTicketStatus, "VOIDED");
  assert.equal(result.reason, "REGISTRATION_CANCELLED");
});

test("resolveTicketStatusFromPaymentRegistration keeps NOT_ISSUED for cancelled registration without issued ticket", () => {
  const result = resolveTicketStatusFromPaymentRegistration({
    paymentStatus: "FAILED",
    registrationStatus: "CANCELLED",
    ticketStatus: "NOT_ISSUED"
  });

  assert.equal(result.result, "NOOP");
  assert.equal(result.nextTicketStatus, "NOT_ISSUED");
});

test("resolveTicketStatusFromPaymentRegistration voids on refunded registration", () => {
  const result = resolveTicketStatusFromPaymentRegistration({
    paymentStatus: "REFUNDED",
    registrationStatus: "REFUNDED",
    ticketStatus: "ISSUED"
  });

  assert.equal(result.result, "UPDATE");
  assert.equal(result.nextTicketStatus, "VOIDED");
});

test("resolveTicketStatusFromPaymentRegistration rejects reissue from VOIDED", () => {
  const result = resolveTicketStatusFromPaymentRegistration({
    paymentStatus: "PAID",
    registrationStatus: "CONFIRMED",
    ticketStatus: "VOIDED"
  });

  assert.equal(result.result, "REJECT");
  assert.equal(result.reason, "TICKET_TRANSITION_NOT_ALLOWED");
});

test("resolveTicketStatusFromPaymentRegistration rejects unknown registration status", () => {
  const result = resolveTicketStatusFromPaymentRegistration({
    paymentStatus: "PAID",
    registrationStatus: "WAITLISTED",
    ticketStatus: "NOT_ISSUED"
  });

  assert.equal(result.result, "REJECT");
  assert.equal(result.reason, "UNSUPPORTED_REGISTRATION_STATUS");
});

test("buildTicketStatusUpdateEvent returns payload for valid update", () => {
  const event = buildTicketStatusUpdateEvent({
    ticketId: "ticket-1",
    registrationId: "reg-1",
    paymentTransactionId: "pay-1",
    paymentStatus: "PAID",
    registrationStatus: "CONFIRMED",
    ticketStatus: "NOT_ISSUED",
    correlationId: "corr-1"
  });

  assert.equal(event.type, "ticket.status.update_requested");
  assert.equal(event.source, "ticketing-service");
  assert.equal(event.toStatus, "ISSUED");
  assert.equal(event.fromStatus, "NOT_ISSUED");
});

test("buildTicketStatusUpdateEvent returns null for no-op", () => {
  const event = buildTicketStatusUpdateEvent({
    paymentStatus: "PENDING",
    registrationStatus: "CONFIRMED",
    ticketStatus: "NOT_ISSUED"
  });

  assert.equal(event, null);
});
