import assert from "node:assert/strict";
import test from "node:test";

import {
  buildModerationResultEvent,
  buildSubmittedForReviewEvent,
  canResubmit,
  isEditableInModerationFlow,
  shouldSubmitForModeration,
  validateModerationTransition
} from "../services/shared/eventModerationHooks.js";

const NOW = new Date("2026-05-10T10:00:00.000Z").getTime();
const EVENT_ID = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const ORGANIZER_ID = "11111111-2222-3333-4444-555555555555";
const CASE_ID = "cccccccc-dddd-eeee-ffff-000000000000";

// ── shouldSubmitForModeration ──────────────────────────────────────────────

test("shouldSubmitForModeration returns false when moderation is disabled", () => {
  assert.equal(
    shouldSubmitForModeration({
      moderationEnabled: false,
      isFirstEventForOrganizer: true,
      organizerHasPriorRejection: true,
      pricingType: "PAID",
      price: 5000
    }),
    false
  );
});

test("shouldSubmitForModeration returns true for first event of organizer", () => {
  assert.equal(
    shouldSubmitForModeration({
      moderationEnabled: true,
      isFirstEventForOrganizer: true,
      organizerHasPriorRejection: false,
      pricingType: "FREE",
      price: 0
    }),
    true
  );
});

test("shouldSubmitForModeration returns true for organizer with prior rejection", () => {
  assert.equal(
    shouldSubmitForModeration({
      moderationEnabled: true,
      isFirstEventForOrganizer: false,
      organizerHasPriorRejection: true,
      pricingType: "FREE",
      price: 0
    }),
    true
  );
});

test("shouldSubmitForModeration returns true for PAID event above threshold", () => {
  assert.equal(
    shouldSubmitForModeration({
      moderationEnabled: true,
      isFirstEventForOrganizer: false,
      organizerHasPriorRejection: false,
      pricingType: "PAID",
      price: 1001
    }),
    true
  );
});

test("shouldSubmitForModeration returns false for PAID event at or below threshold", () => {
  assert.equal(
    shouldSubmitForModeration({
      moderationEnabled: true,
      isFirstEventForOrganizer: false,
      organizerHasPriorRejection: false,
      pricingType: "PAID",
      price: 1000
    }),
    false
  );
});

test("shouldSubmitForModeration returns false for ordinary FREE event", () => {
  assert.equal(
    shouldSubmitForModeration({
      moderationEnabled: true,
      isFirstEventForOrganizer: false,
      organizerHasPriorRejection: false,
      pricingType: "FREE",
      price: 0
    }),
    false
  );
});

test("shouldSubmitForModeration respects custom threshold", () => {
  assert.equal(
    shouldSubmitForModeration({
      moderationEnabled: true,
      isFirstEventForOrganizer: false,
      organizerHasPriorRejection: false,
      pricingType: "PAID",
      price: 500,
      moderationThresholdPrice: 400
    }),
    true
  );
});

// ── validateModerationTransition ───────────────────────────────────────────

test("approve from PENDING_REVIEW → PUBLISHED", () => {
  const result = validateModerationTransition({
    currentStatus: "PENDING_REVIEW",
    action: "approve"
  });
  assert.equal(result.valid, true);
  assert.equal(result.nextStatus, "PUBLISHED");
  assert.equal(result.error, null);
});

test("reject from PENDING_REVIEW → CANCELLED", () => {
  const result = validateModerationTransition({
    currentStatus: "PENDING_REVIEW",
    action: "reject"
  });
  assert.equal(result.valid, true);
  assert.equal(result.nextStatus, "CANCELLED");
});

test("request_changes from PENDING_REVIEW → CHANGES_REQUESTED", () => {
  const result = validateModerationTransition({
    currentStatus: "PENDING_REVIEW",
    action: "request_changes"
  });
  assert.equal(result.valid, true);
  assert.equal(result.nextStatus, "CHANGES_REQUESTED");
});

test("approve from CHANGES_REQUESTED → PUBLISHED", () => {
  const result = validateModerationTransition({
    currentStatus: "CHANGES_REQUESTED",
    action: "approve"
  });
  assert.equal(result.valid, true);
  assert.equal(result.nextStatus, "PUBLISHED");
});

test("reject from CHANGES_REQUESTED → CANCELLED", () => {
  const result = validateModerationTransition({
    currentStatus: "CHANGES_REQUESTED",
    action: "reject"
  });
  assert.equal(result.valid, true);
  assert.equal(result.nextStatus, "CANCELLED");
});

test("suspend from PUBLISHED → SUSPENDED", () => {
  const result = validateModerationTransition({
    currentStatus: "PUBLISHED",
    action: "suspend"
  });
  assert.equal(result.valid, true);
  assert.equal(result.nextStatus, "SUSPENDED");
});

test("reopen from SUSPENDED → PENDING_REVIEW", () => {
  const result = validateModerationTransition({
    currentStatus: "SUSPENDED",
    action: "reopen"
  });
  assert.equal(result.valid, true);
  assert.equal(result.nextStatus, "PENDING_REVIEW");
});

test("suspend from PENDING_REVIEW is rejected (not in matrix)", () => {
  const result = validateModerationTransition({
    currentStatus: "PENDING_REVIEW",
    action: "suspend"
  });
  assert.equal(result.valid, false);
  assert.ok(result.error.includes("PENDING_REVIEW"));
});

test("unknown action is rejected", () => {
  const result = validateModerationTransition({
    currentStatus: "PENDING_REVIEW",
    action: "delete_everything"
  });
  assert.equal(result.valid, false);
  assert.ok(result.error.includes("delete_everything"));
});

test("action from terminal status CANCELLED is rejected", () => {
  const result = validateModerationTransition({
    currentStatus: "CANCELLED",
    action: "approve"
  });
  assert.equal(result.valid, false);
  assert.ok(result.error.includes("CANCELLED"));
});

// ── isEditableInModerationFlow ─────────────────────────────────────────────

test("CHANGES_REQUESTED is editable by organizer", () => {
  assert.equal(isEditableInModerationFlow("CHANGES_REQUESTED"), true);
});

test("PENDING_REVIEW is NOT editable by organizer", () => {
  assert.equal(isEditableInModerationFlow("PENDING_REVIEW"), false);
});

test("DRAFT is not in moderation flow editable set", () => {
  assert.equal(isEditableInModerationFlow("DRAFT"), false);
});

// ── canResubmit ────────────────────────────────────────────────────────────

test("DRAFT can be submitted for publication", () => {
  assert.equal(canResubmit("DRAFT"), true);
});

test("CHANGES_REQUESTED can be re-submitted", () => {
  assert.equal(canResubmit("CHANGES_REQUESTED"), true);
});

test("PENDING_REVIEW cannot be submitted again", () => {
  assert.equal(canResubmit("PENDING_REVIEW"), false);
});

test("PUBLISHED cannot be re-submitted", () => {
  assert.equal(canResubmit("PUBLISHED"), false);
});

// ── buildSubmittedForReviewEvent ───────────────────────────────────────────

test("buildSubmittedForReviewEvent produces correct domain event shape", () => {
  const evt = buildSubmittedForReviewEvent({
    eventId: EVENT_ID,
    organizerId: ORGANIZER_ID,
    caseId: CASE_ID,
    nowMs: NOW
  });

  assert.equal(evt.type, "event.submitted_for_review");
  assert.equal(evt.eventId, EVENT_ID);
  assert.equal(evt.organizerId, ORGANIZER_ID);
  assert.equal(evt.caseId, CASE_ID);
  assert.equal(evt.submittedAt, "2026-05-10T10:00:00.000Z");
});

// ── buildModerationResultEvent ─────────────────────────────────────────────

test("buildModerationResultEvent for approve produces event.published", () => {
  const evt = buildModerationResultEvent({
    action: "approve",
    eventId: EVENT_ID,
    organizerId: ORGANIZER_ID,
    reasonCode: null,
    caseId: CASE_ID,
    nowMs: NOW
  });

  assert.equal(evt.type, "event.published");
  assert.equal(evt.eventId, EVENT_ID);
  assert.equal(evt.publishedAt, "2026-05-10T10:00:00.000Z");
});

test("buildModerationResultEvent for reject produces event.rejected with reasonCode", () => {
  const evt = buildModerationResultEvent({
    action: "reject",
    eventId: EVENT_ID,
    organizerId: ORGANIZER_ID,
    reasonCode: "CONTENT_VIOLATION",
    caseId: CASE_ID,
    nowMs: NOW
  });

  assert.equal(evt.type, "event.rejected");
  assert.equal(evt.reasonCode, "CONTENT_VIOLATION");
  assert.equal(evt.caseId, CASE_ID);
  assert.equal(evt.rejectedAt, "2026-05-10T10:00:00.000Z");
});

test("buildModerationResultEvent for request_changes produces event.changes_requested", () => {
  const evt = buildModerationResultEvent({
    action: "request_changes",
    eventId: EVENT_ID,
    organizerId: ORGANIZER_ID,
    reasonCode: "INCOMPLETE_INFO",
    caseId: CASE_ID,
    nowMs: NOW
  });

  assert.equal(evt.type, "event.changes_requested");
  assert.equal(evt.reasonCode, "INCOMPLETE_INFO");
  assert.equal(evt.requestedAt, "2026-05-10T10:00:00.000Z");
});

test("buildModerationResultEvent for reject defaults reasonCode to OTHER when null", () => {
  const evt = buildModerationResultEvent({
    action: "reject",
    eventId: EVENT_ID,
    organizerId: ORGANIZER_ID,
    reasonCode: null,
    caseId: CASE_ID,
    nowMs: NOW
  });

  assert.equal(evt.reasonCode, "OTHER");
});

test("buildModerationResultEvent for suspend produces event.suspended", () => {
  const evt = buildModerationResultEvent({
    action: "suspend",
    eventId: EVENT_ID,
    organizerId: ORGANIZER_ID,
    reasonCode: "FRAUD_RISK",
    caseId: CASE_ID,
    nowMs: NOW
  });

  assert.equal(evt.type, "event.suspended");
  assert.equal(evt.reasonCode, "FRAUD_RISK");
  assert.ok(evt.suspendedAt);
});
