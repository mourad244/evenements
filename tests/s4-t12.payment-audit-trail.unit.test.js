import assert from "node:assert/strict";
import test from "node:test";

import {
  appendAuditEntries,
  buildManualReconciliationAuditTrail,
  createPaymentAuditEntry,
  normalizeAuditAction,
  normalizeAuditResult
} from "../services/shared/paymentAuditTrail.js";
import { applyManualReconciliationAction } from "../services/shared/paymentManualReconciliation.js";

test("normalizeAuditAction and normalizeAuditResult return safe defaults", () => {
  assert.equal(normalizeAuditAction("payment_status_updated"), "PAYMENT_STATUS_UPDATED");
  assert.equal(normalizeAuditAction("unknown_action"), "PAYMENT_MANUAL_ACTION_APPLIED");
  assert.equal(normalizeAuditResult("rejected"), "REJECTED");
  assert.equal(normalizeAuditResult("invalid"), "SUCCESS");
});

test("createPaymentAuditEntry builds readable status-transition summary", () => {
  const entry = createPaymentAuditEntry({
    action: "PAYMENT_STATUS_UPDATED",
    result: "SUCCESS",
    paymentTransactionId: "pay-1",
    fromStatus: "PENDING",
    toStatus: "PAID"
  });

  assert.equal(entry.action, "PAYMENT_STATUS_UPDATED");
  assert.match(entry.summary, /PENDING -> PAID/);
  assert.equal(entry.paymentTransactionId, "pay-1");
});

test("buildManualReconciliationAuditTrail includes transition entries for changed states", () => {
  const entries = buildManualReconciliationAuditTrail({
    manualAction: "MARK_RESOLVED_PAID",
    beforeState: {
      transaction: { paymentTransactionId: "pay-2", status: "PENDING", reconciliationStatus: "IN_PROGRESS" },
      registration: { registrationId: "reg-2", status: "PENDING_PAYMENT" },
      ticket: { ticketId: "ticket-2", status: "NOT_ISSUED" }
    },
    afterState: {
      transaction: { paymentTransactionId: "pay-2", status: "PAID", reconciliationStatus: "RESOLVED" },
      registration: { registrationId: "reg-2", status: "CONFIRMED" },
      ticket: { ticketId: "ticket-2", status: "ISSUED" }
    },
    actorId: "admin-2",
    correlationId: "corr-2"
  });

  assert.ok(entries.some((entry) => entry.action === "PAYMENT_MANUAL_ACTION_APPLIED"));
  assert.ok(entries.some((entry) => entry.action === "PAYMENT_STATUS_UPDATED"));
  assert.ok(
    entries.some((entry) => entry.action === "PAYMENT_RECONCILIATION_STATUS_UPDATED")
  );
  assert.ok(
    entries.some((entry) => entry.action === "REGISTRATION_STATUS_UPDATED_FROM_PAYMENT")
  );
  assert.ok(
    entries.some((entry) => entry.action === "TICKET_STATUS_UPDATED_FROM_REGISTRATION")
  );
});

test("appendAuditEntries keeps newest entries within maxEntries", () => {
  const current = [
    createPaymentAuditEntry({ action: "PAYMENT_MANUAL_ACTION_APPLIED", metadata: { idx: 1 } }),
    createPaymentAuditEntry({ action: "PAYMENT_MANUAL_ACTION_APPLIED", metadata: { idx: 2 } })
  ];
  const incoming = [
    createPaymentAuditEntry({ action: "PAYMENT_MANUAL_ACTION_APPLIED", metadata: { idx: 3 } }),
    createPaymentAuditEntry({ action: "PAYMENT_MANUAL_ACTION_APPLIED", metadata: { idx: 4 } })
  ];

  const trimmed = appendAuditEntries(current, incoming, { maxEntries: 3 });
  assert.equal(trimmed.length, 3);
  assert.deepEqual(
    trimmed.map((entry) => entry.metadata.idx),
    [2, 3, 4]
  );
});

test("applyManualReconciliationAction emits readable audit traces for annotation", () => {
  const resolution = applyManualReconciliationAction({
    transaction: {
      paymentTransactionId: "pay-3",
      status: "PENDING",
      reconciliationStatus: "NEEDS_REVIEW"
    },
    registration: {
      registrationId: "reg-3",
      status: "PENDING_PAYMENT"
    },
    ticket: {
      ticketId: "ticket-3",
      status: "NOT_ISSUED"
    },
    action: "ANNOTATE_CASE",
    note: "Waiting for provider callback",
    actorId: "admin-3",
    correlationId: "corr-3"
  });

  assert.equal(resolution.ok, true);
  assert.ok(
    resolution.audits.some((entry) => entry.action === "PAYMENT_MANUAL_ACTION_APPLIED")
  );
  assert.ok(
    resolution.audits.some(
      (entry) => entry.action === "PAYMENT_RECONCILIATION_CASE_ANNOTATED"
    )
  );
  assert.ok(resolution.audits.every((entry) => typeof entry.summary === "string"));
});

test("applyManualReconciliationAction emits transaction and manual override traces", () => {
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
      status: "NOT_ISSUED"
    },
    action: "MARK_RESOLVED_PAID",
    note: "Provider confirms capture",
    actorId: "admin-4",
    correlationId: "corr-4"
  });

  assert.equal(resolution.ok, true);
  assert.ok(
    resolution.audits.some((entry) => entry.action === "PAYMENT_STATUS_UPDATED")
  );
  assert.ok(
    resolution.audits.some((entry) => entry.action === "PAYMENT_MANUAL_OVERRIDE_APPLIED")
  );
  assert.ok(
    resolution.audits.some(
      (entry) => entry.action === "REGISTRATION_STATUS_UPDATED_FROM_PAYMENT"
    )
  );
  assert.ok(
    resolution.audits.some(
      (entry) => entry.action === "TICKET_STATUS_UPDATED_FROM_REGISTRATION"
    )
  );
});
