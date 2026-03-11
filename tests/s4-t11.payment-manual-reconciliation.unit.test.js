import assert from "node:assert/strict";
import test from "node:test";

import {
  applyManualReconciliationAction,
  normalizeReconciliationAction,
  normalizeReconciliationStatus,
  resolveAvailableReconciliationActions
} from "../services/shared/paymentManualReconciliation.js";

test("normalizeReconciliationStatus validates known values", () => {
  assert.equal(normalizeReconciliationStatus("needs_review"), "NEEDS_REVIEW");
  assert.equal(normalizeReconciliationStatus("invalid"), "NONE");
});

test("normalizeReconciliationAction validates known values", () => {
  assert.equal(normalizeReconciliationAction("mark_resolved_paid"), "MARK_RESOLVED_PAID");
  assert.equal(normalizeReconciliationAction("unknown"), "UNKNOWN");
});

test("resolveAvailableReconciliationActions exposes retry/resolve actions for reviewable pending case", () => {
  const available = resolveAvailableReconciliationActions({
    status: "PENDING",
    reconciliationStatus: "NEEDS_REVIEW"
  });

  assert.deepEqual(available.actions, [
    "ANNOTATE_CASE",
    "MARK_IRRECOVERABLE",
    "RETRY_PROVIDER_CHECK",
    "MARK_RESOLVED_PAID",
    "MARK_RESOLVED_FAILED"
  ]);
});

test("applyManualReconciliationAction annotates a case and keeps business states", () => {
  const resolution = applyManualReconciliationAction({
    transaction: {
      paymentTransactionId: "pay-1",
      status: "PENDING",
      reconciliationStatus: "NEEDS_REVIEW"
    },
    registration: {
      registrationId: "reg-1",
      status: "PENDING_PAYMENT"
    },
    ticket: {
      ticketId: "ticket-1",
      status: "NOT_ISSUED"
    },
    action: "ANNOTATE_CASE",
    note: "Investigate webhook delay",
    actorId: "admin-1",
    correlationId: "corr-1"
  });

  assert.equal(resolution.ok, true);
  assert.equal(resolution.transaction.status, "PENDING");
  assert.equal(resolution.registration.status, "PENDING_PAYMENT");
  assert.equal(resolution.ticket.status, "NOT_ISSUED");
  assert.equal(resolution.events[0].type, "payment.reconciliation.case_annotated");
  assert.equal(resolution.transaction.reconciliationNotes.length, 1);
});

test("applyManualReconciliationAction retries provider check and increments attempts", () => {
  const resolution = applyManualReconciliationAction({
    transaction: {
      paymentTransactionId: "pay-2",
      status: "PENDING",
      reconciliationStatus: "NEEDS_REVIEW",
      reconciliationAttempts: 2
    },
    registration: { status: "PENDING_PAYMENT" },
    ticket: { status: "NOT_ISSUED" },
    action: "RETRY_PROVIDER_CHECK",
    actorId: "admin-2"
  });

  assert.equal(resolution.ok, true);
  assert.equal(resolution.transaction.reconciliationStatus, "IN_PROGRESS");
  assert.equal(resolution.transaction.reconciliationAttempts, 3);
  assert.equal(resolution.events[0].type, "payment.reconciliation.retry_requested");
});

test("applyManualReconciliationAction resolves case to PAID and propagates statuses", () => {
  const resolution = applyManualReconciliationAction({
    transaction: {
      paymentTransactionId: "pay-3",
      status: "PENDING",
      reconciliationStatus: "IN_PROGRESS"
    },
    registration: {
      registrationId: "reg-3",
      status: "PENDING_PAYMENT"
    },
    ticket: {
      ticketId: "ticket-3",
      status: "NOT_ISSUED"
    },
    action: "MARK_RESOLVED_PAID",
    note: "Provider confirms payment",
    actorId: "admin-3",
    correlationId: "corr-3"
  });

  assert.equal(resolution.ok, true);
  assert.equal(resolution.transaction.status, "PAID");
  assert.equal(resolution.transaction.reconciliationStatus, "RESOLVED");
  assert.equal(resolution.registration.status, "CONFIRMED");
  assert.equal(resolution.ticket.status, "ISSUED");
  assert.ok(
    resolution.events.some(
      (event) => event.type === "registration.status.update_requested"
    )
  );
  assert.ok(
    resolution.events.some((event) => event.type === "ticket.status.update_requested")
  );
});

test("applyManualReconciliationAction resolves case to FAILED and voids already issued ticket", () => {
  const resolution = applyManualReconciliationAction({
    transaction: {
      paymentTransactionId: "pay-4",
      status: "PENDING",
      reconciliationStatus: "IN_PROGRESS"
    },
    registration: {
      registrationId: "reg-4",
      status: "PENDING_PAYMENT"
    },
    ticket: {
      ticketId: "ticket-4",
      status: "ISSUED"
    },
    action: "MARK_RESOLVED_FAILED",
    note: "Provider declined payment",
    actorId: "admin-4"
  });

  assert.equal(resolution.ok, true);
  assert.equal(resolution.transaction.status, "FAILED");
  assert.equal(resolution.registration.status, "CANCELLED");
  assert.equal(resolution.ticket.status, "VOIDED");
});

test("applyManualReconciliationAction rejects manual paid resolution when registration transition is invalid", () => {
  const resolution = applyManualReconciliationAction({
    transaction: {
      paymentTransactionId: "pay-5",
      status: "FAILED",
      reconciliationStatus: "IN_PROGRESS"
    },
    registration: {
      registrationId: "reg-5",
      status: "CANCELLED"
    },
    ticket: {
      ticketId: "ticket-5",
      status: "VOIDED"
    },
    action: "MARK_RESOLVED_PAID",
    note: "Operator mistake"
  });

  assert.equal(resolution.ok, false);
  assert.equal(resolution.reason, "REGISTRATION_PROPAGATION_REJECTED");
});

test("applyManualReconciliationAction marks case irrecoverable with note", () => {
  const resolution = applyManualReconciliationAction({
    transaction: {
      paymentTransactionId: "pay-6",
      status: "FAILED",
      reconciliationStatus: "NEEDS_REVIEW"
    },
    registration: { status: "CANCELLED" },
    ticket: { status: "NOT_ISSUED" },
    action: "MARK_IRRECOVERABLE",
    note: "Provider account blocked"
  });

  assert.equal(resolution.ok, true);
  assert.equal(resolution.transaction.reconciliationStatus, "IRRECOVERABLE");
  assert.equal(
    resolution.events[0].type,
    "payment.reconciliation.irrecoverable_marked"
  );
});

test("applyManualReconciliationAction rejects retry when case is already resolved", () => {
  const resolution = applyManualReconciliationAction({
    transaction: {
      paymentTransactionId: "pay-7",
      status: "PAID",
      reconciliationStatus: "RESOLVED"
    },
    registration: { status: "CONFIRMED" },
    ticket: { status: "ISSUED" },
    action: "RETRY_PROVIDER_CHECK"
  });

  assert.equal(resolution.ok, false);
  assert.equal(resolution.reason, "ACTION_NOT_ALLOWED");
});
