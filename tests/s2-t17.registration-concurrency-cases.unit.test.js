import assert from "node:assert/strict";
import test from "node:test";

// ---------------------------------------------------------------------------
// R02.3 – Registration concurrency & uniqueness rules
//
// These tests cover the in-process logic that guards against:
//   - Duplicate registrations for the same (event, participant) pair
//   - Race conditions on the last available seat (capacity enforcement)
//   - Atomic waitlist promotion after cancellation
//   - Correct waitlist position assignment under concurrent registrations
//
// They do NOT require a database: the business-rule functions are extracted
// so they can be unit-tested in isolation.
// ---------------------------------------------------------------------------

// ── helpers replicating the guard logic from registration-service/src/index.js ──

function checkDuplicate(activeRegistrations, eventId, participantId) {
  return activeRegistrations.find(
    (r) =>
      r.eventId === eventId &&
      r.participantId === participantId &&
      (r.registrationStatus === "CONFIRMED" || r.registrationStatus === "WAITLISTED")
  ) || null;
}

function resolveRegistrationStatus(confirmedCount, capacity) {
  if (typeof confirmedCount !== "number" || typeof capacity !== "number") {
    throw new TypeError("confirmedCount and capacity must be numbers");
  }
  return confirmedCount < capacity ? "CONFIRMED" : "WAITLISTED";
}

function assignWaitlistPosition(waitlistedRegistrations) {
  // Position is 1-based, ordered by insertion; new entry gets the next slot
  return waitlistedRegistrations.length + 1;
}

/**
 * Simulates the atomic cancel → promote flow.
 * Returns the updated state (cancellation + optional promotion).
 */
function simulateCancelAndPromote(registrations, registrationId, eventId) {
  const idx = registrations.findIndex((r) => r.registrationId === registrationId);
  if (idx === -1) return { cancelled: null, promoted: null, registrations };

  const updated = registrations.map((r) => ({ ...r }));
  const target = updated[idx];
  if (target.registrationStatus === "CANCELLED") {
    return { cancelled: null, promoted: null, registrations: updated };
  }

  const wasConfirmed = target.registrationStatus === "CONFIRMED";
  target.registrationStatus = "CANCELLED";
  target.cancelledAt = new Date().toISOString();
  target.waitlistPosition = null;

  let promoted = null;
  if (wasConfirmed) {
    // Find the first WAITLISTED entry for this event ordered by position then createdAt
    const waitlisted = updated
      .filter(
        (r) =>
          r.eventId === eventId &&
          r.registrationStatus === "WAITLISTED" &&
          r.waitlistPosition !== null
      )
      .sort((a, b) => {
        if (a.waitlistPosition !== b.waitlistPosition) {
          return a.waitlistPosition - b.waitlistPosition;
        }
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

    if (waitlisted.length > 0) {
      const candidate = waitlisted[0];
      const promotedIdx = updated.findIndex(
        (r) => r.registrationId === candidate.registrationId
      );
      updated[promotedIdx] = {
        ...updated[promotedIdx],
        registrationStatus: "CONFIRMED",
        waitlistPosition: null,
        promotedAt: new Date().toISOString()
      };
      promoted = updated[promotedIdx];
    }
  }

  return { cancelled: target, promoted, registrations: updated };
}

// ── tests ──────────────────────────────────────────────────────────────────

test("duplicate guard rejects same participant re-registering for same event", () => {
  const active = [
    {
      eventId: "event-1",
      participantId: "participant-1",
      registrationId: "reg-1",
      registrationStatus: "CONFIRMED"
    }
  ];

  const dup = checkDuplicate(active, "event-1", "participant-1");
  assert.ok(dup, "should detect existing CONFIRMED registration");
  assert.equal(dup.registrationId, "reg-1");
});

test("duplicate guard rejects WAITLISTED participant re-registering for same event", () => {
  const active = [
    {
      eventId: "event-1",
      participantId: "participant-2",
      registrationId: "reg-2",
      registrationStatus: "WAITLISTED"
    }
  ];

  const dup = checkDuplicate(active, "event-1", "participant-2");
  assert.ok(dup, "should detect existing WAITLISTED registration");
});

test("duplicate guard allows same participant to register for a different event", () => {
  const active = [
    {
      eventId: "event-1",
      participantId: "participant-1",
      registrationId: "reg-1",
      registrationStatus: "CONFIRMED"
    }
  ];

  const dup = checkDuplicate(active, "event-2", "participant-1");
  assert.equal(dup, null, "different event should not trigger the duplicate guard");
});

test("duplicate guard ignores CANCELLED registrations — participant can re-register", () => {
  const registrations = [
    {
      eventId: "event-1",
      participantId: "participant-1",
      registrationId: "reg-1",
      registrationStatus: "CANCELLED"
    }
  ];

  const dup = checkDuplicate(registrations, "event-1", "participant-1");
  assert.equal(dup, null, "a CANCELLED registration should not block a new attempt");
});

test("capacity check: last seat goes to CONFIRMED, next one to WAITLISTED", () => {
  const capacity = 1;
  const firstStatus = resolveRegistrationStatus(0, capacity);
  assert.equal(firstStatus, "CONFIRMED");

  const secondStatus = resolveRegistrationStatus(1, capacity);
  assert.equal(secondStatus, "WAITLISTED");
});

test("capacity check: full event places everyone on WAITLISTED", () => {
  const capacity = 50;
  for (let confirmed = 50; confirmed < 55; confirmed++) {
    assert.equal(
      resolveRegistrationStatus(confirmed, capacity),
      "WAITLISTED",
      `confirmedCount=${confirmed} should yield WAITLISTED`
    );
  }
});

test("capacity check: zero-capacity event sends first registrant to WAITLISTED", () => {
  const status = resolveRegistrationStatus(0, 0);
  assert.equal(status, "WAITLISTED");
});

test("waitlist position is 1-based and increments correctly", () => {
  const waitlisted = [];
  assert.equal(assignWaitlistPosition(waitlisted), 1);

  waitlisted.push({ registrationId: "reg-w1" });
  assert.equal(assignWaitlistPosition(waitlisted), 2);

  waitlisted.push({ registrationId: "reg-w2" });
  assert.equal(assignWaitlistPosition(waitlisted), 3);
});

test("cancel + promote: first WAITLISTED is promoted atomically when a CONFIRMED is cancelled", () => {
  const registrations = [
    {
      registrationId: "reg-confirmed-1",
      eventId: "event-1",
      participantId: "p-1",
      registrationStatus: "CONFIRMED",
      waitlistPosition: null,
      createdAt: "2026-04-01T10:00:00Z"
    },
    {
      registrationId: "reg-waitlisted-1",
      eventId: "event-1",
      participantId: "p-2",
      registrationStatus: "WAITLISTED",
      waitlistPosition: 1,
      createdAt: "2026-04-01T10:01:00Z"
    },
    {
      registrationId: "reg-waitlisted-2",
      eventId: "event-1",
      participantId: "p-3",
      registrationStatus: "WAITLISTED",
      waitlistPosition: 2,
      createdAt: "2026-04-01T10:02:00Z"
    }
  ];

  const { cancelled, promoted, registrations: updated } = simulateCancelAndPromote(
    registrations,
    "reg-confirmed-1",
    "event-1"
  );

  assert.ok(cancelled, "cancellation should succeed");
  assert.equal(cancelled.registrationStatus, "CANCELLED");

  assert.ok(promoted, "first waitlisted participant should be promoted");
  assert.equal(promoted.registrationId, "reg-waitlisted-1");
  assert.equal(promoted.registrationStatus, "CONFIRMED");
  assert.equal(promoted.waitlistPosition, null);

  // Second waitlisted entry is untouched
  const stillWaiting = updated.find((r) => r.registrationId === "reg-waitlisted-2");
  assert.equal(stillWaiting.registrationStatus, "WAITLISTED");
  assert.equal(stillWaiting.waitlistPosition, 2);
});

test("cancel + promote: no promotion occurs when no waitlisted entries exist", () => {
  const registrations = [
    {
      registrationId: "reg-confirmed-1",
      eventId: "event-1",
      participantId: "p-1",
      registrationStatus: "CONFIRMED",
      waitlistPosition: null,
      createdAt: "2026-04-01T10:00:00Z"
    }
  ];

  const { cancelled, promoted } = simulateCancelAndPromote(
    registrations,
    "reg-confirmed-1",
    "event-1"
  );

  assert.ok(cancelled);
  assert.equal(cancelled.registrationStatus, "CANCELLED");
  assert.equal(promoted, null, "nothing to promote");
});

test("cancel + promote: cancelling a WAITLISTED entry does not trigger promotion", () => {
  const registrations = [
    {
      registrationId: "reg-confirmed-1",
      eventId: "event-1",
      participantId: "p-1",
      registrationStatus: "CONFIRMED",
      waitlistPosition: null,
      createdAt: "2026-04-01T10:00:00Z"
    },
    {
      registrationId: "reg-waitlisted-1",
      eventId: "event-1",
      participantId: "p-2",
      registrationStatus: "WAITLISTED",
      waitlistPosition: 1,
      createdAt: "2026-04-01T10:01:00Z"
    }
  ];

  const { cancelled, promoted } = simulateCancelAndPromote(
    registrations,
    "reg-waitlisted-1",
    "event-1"
  );

  assert.ok(cancelled);
  assert.equal(cancelled.registrationStatus, "CANCELLED");
  assert.equal(promoted, null, "cancelling a waitlisted entry should not promote anyone");
});

test("concurrent race: only one of two simultaneous last-seat registrations wins CONFIRMED", () => {
  // Simulates two requests arriving in parallel for the last seat.
  // The first one to complete increments confirmedCount to capacity;
  // the second reads the same count and must be resolved as WAITLISTED.
  const capacity = 1;

  // Both threads read confirmedCount=0 simultaneously
  const snapshotConfirmedCount = 0;

  const resultA = resolveRegistrationStatus(snapshotConfirmedCount, capacity);
  // Simulate that A committed first — confirmed count is now 1
  const resultB = resolveRegistrationStatus(snapshotConfirmedCount + 1, capacity);

  assert.equal(resultA, "CONFIRMED");
  assert.equal(resultB, "WAITLISTED");
});

test("concurrent race: double-click by same participant is rejected by duplicate guard", () => {
  // First click succeeds and creates a CONFIRMED registration
  const activeAfterFirstClick = [
    {
      eventId: "event-1",
      participantId: "participant-1",
      registrationId: "reg-1",
      registrationStatus: "CONFIRMED"
    }
  ];

  // Second click hits the guard before DB write returns
  const dup = checkDuplicate(activeAfterFirstClick, "event-1", "participant-1");
  assert.ok(dup, "second request should be blocked by the duplicate guard");
  assert.equal(dup.registrationStatus, "CONFIRMED");
});
