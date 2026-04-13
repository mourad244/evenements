import assert from "node:assert/strict";
import test from "node:test";

import {
  buildScheduledPublishRecord,
  buildScheduledPublishTriggeredEvent,
  pickDueScheduledPublications,
  validateCancelScheduledPublish,
  validateScheduledPublishRequest
} from "../services/shared/eventScheduledPublish.js";

const NOW = new Date("2026-04-11T12:00:00.000Z").getTime();
const FUTURE = new Date("2026-04-12T09:00:00.000Z").toISOString(); // tomorrow
const PAST = new Date("2026-04-10T09:00:00.000Z").toISOString();   // yesterday

// ── validateScheduledPublishRequest ────────────────────────────────────────

test("validateScheduledPublishRequest accepts a valid future publishAt for DRAFT", () => {
  const result = validateScheduledPublishRequest({
    eventId: "event-1",
    organizerId: "org-1",
    eventOwnerId: "org-1",
    currentStatus: "DRAFT",
    publishAt: FUTURE,
    nowMs: NOW
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
  assert.ok(typeof result.publishAtMs === "number");
  assert.ok(result.publishAtMs > NOW);
});

test("validateScheduledPublishRequest rejects publishAt in the past", () => {
  const result = validateScheduledPublishRequest({
    eventId: "event-1",
    organizerId: "org-1",
    eventOwnerId: "org-1",
    currentStatus: "DRAFT",
    publishAt: PAST,
    nowMs: NOW
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("future")));
  assert.equal(result.publishAtMs, null);
});

test("validateScheduledPublishRequest rejects non-DRAFT events", () => {
  for (const status of ["PUBLISHED", "CANCELLED", "FULL", "CLOSED"]) {
    const result = validateScheduledPublishRequest({
      eventId: "event-1",
      organizerId: "org-1",
      eventOwnerId: "org-1",
      currentStatus: status,
      publishAt: FUTURE,
      nowMs: NOW
    });

    assert.equal(result.valid, false, `should reject status=${status}`);
    assert.ok(
      result.errors.some((e) => e.includes("DRAFT")),
      `error message should mention DRAFT for status=${status}`
    );
  }
});

test("validateScheduledPublishRequest rejects organizer that does not own the event", () => {
  const result = validateScheduledPublishRequest({
    eventId: "event-1",
    organizerId: "org-intruder",
    eventOwnerId: "org-1",
    currentStatus: "DRAFT",
    publishAt: FUTURE,
    nowMs: NOW
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("owning organizer")));
});

test("validateScheduledPublishRequest rejects missing eventId", () => {
  const result = validateScheduledPublishRequest({
    eventId: "",
    organizerId: "org-1",
    eventOwnerId: "org-1",
    currentStatus: "DRAFT",
    publishAt: FUTURE,
    nowMs: NOW
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("eventId")));
});

test("validateScheduledPublishRequest rejects a malformed publishAt", () => {
  const result = validateScheduledPublishRequest({
    eventId: "event-1",
    organizerId: "org-1",
    eventOwnerId: "org-1",
    currentStatus: "DRAFT",
    publishAt: "not-a-date",
    nowMs: NOW
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("ISO-8601")));
});

// ── buildScheduledPublishRecord ────────────────────────────────────────────

test("buildScheduledPublishRecord produces a PENDING record with correct shape", () => {
  const record = buildScheduledPublishRecord({
    eventId: "event-1",
    organizerId: "org-1",
    publishAt: FUTURE,
    nowMs: NOW
  });

  assert.equal(record.eventId, "event-1");
  assert.equal(record.organizerId, "org-1");
  assert.equal(record.publishAt, FUTURE);
  assert.equal(record.status, "PENDING");
  assert.ok(record.scheduledAt);
});

// ── pickDueScheduledPublications ───────────────────────────────────────────

test("pickDueScheduledPublications returns records whose publishAt has passed", () => {
  const records = [
    { eventId: "event-1", publishAt: PAST, status: "PENDING" },
    { eventId: "event-2", publishAt: FUTURE, status: "PENDING" },
    { eventId: "event-3", publishAt: PAST, status: "DONE" } // already processed
  ];

  const due = pickDueScheduledPublications(records, NOW);

  assert.equal(due.length, 1);
  assert.equal(due[0].eventId, "event-1");
});

test("pickDueScheduledPublications returns empty list when nothing is due", () => {
  const records = [
    { eventId: "event-1", publishAt: FUTURE, status: "PENDING" }
  ];

  const due = pickDueScheduledPublications(records, NOW);
  assert.equal(due.length, 0);
});

test("pickDueScheduledPublications ignores already-processed records", () => {
  const records = [
    { eventId: "event-1", publishAt: PAST, status: "DONE" },
    { eventId: "event-2", publishAt: PAST, status: "FAILED" }
  ];

  const due = pickDueScheduledPublications(records, NOW);
  assert.equal(due.length, 0);
});

// ── buildScheduledPublishTriggeredEvent ────────────────────────────────────

test("buildScheduledPublishTriggeredEvent builds canonical domain event", () => {
  const evt = buildScheduledPublishTriggeredEvent({
    eventId: "event-1",
    organizerId: "org-1",
    publishAt: FUTURE,
    nowMs: NOW
  });

  assert.equal(evt.type, "event.scheduled_publish_triggered");
  assert.equal(evt.eventId, "event-1");
  assert.equal(evt.organizerId, "org-1");
  assert.equal(evt.scheduledPublishAt, FUTURE);
  assert.ok(evt.triggeredAt);
});

// ── validateCancelScheduledPublish ─────────────────────────────────────────

test("validateCancelScheduledPublish allows the owning organizer to cancel a PENDING schedule", () => {
  const result = validateCancelScheduledPublish({
    organizerId: "org-1",
    recordOwnerId: "org-1",
    recordStatus: "PENDING"
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("validateCancelScheduledPublish rejects a different organizer", () => {
  const result = validateCancelScheduledPublish({
    organizerId: "org-intruder",
    recordOwnerId: "org-1",
    recordStatus: "PENDING"
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("owning organizer")));
});

test("validateCancelScheduledPublish rejects cancellation of an already-processed record", () => {
  for (const status of ["DONE", "FAILED"]) {
    const result = validateCancelScheduledPublish({
      organizerId: "org-1",
      recordOwnerId: "org-1",
      recordStatus: status
    });

    assert.equal(result.valid, false, `should reject status=${status}`);
    assert.ok(result.errors.some((e) => e.includes(status)));
  }
});
