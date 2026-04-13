/**
 * E03.3 – Scheduled / deferred event publication
 *
 * Provides the business-rule layer for accepting a future `publishAt` date on
 * a draft event and for determining when that scheduled transition should fire.
 *
 * The module is intentionally side-effect-free: persistence and timer
 * management stay in the host service.  That makes the rules unit-testable
 * without a database or real clock.
 */

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validates a scheduled-publish request payload.
 *
 * @param {object} params
 * @param {string} params.eventId
 * @param {string} params.organizerId  The actor submitting the request.
 * @param {string} params.eventOwnerId The event's stored organizerId.
 * @param {string} params.currentStatus The event's current lifecycle status.
 * @param {string} params.publishAt  ISO-8601 timestamp for the desired publication.
 * @param {number} [params.nowMs]    Override for the current epoch ms (testing).
 * @returns {{ valid: boolean, errors: string[], publishAtMs: number|null }}
 */
export function validateScheduledPublishRequest({
  eventId,
  organizerId,
  eventOwnerId,
  currentStatus,
  publishAt,
  nowMs = Date.now()
}) {
  const errors = [];

  if (!eventId) errors.push("eventId is required");
  if (!organizerId) errors.push("organizerId is required");

  if (organizerId && eventOwnerId && organizerId !== eventOwnerId) {
    errors.push("Only the owning organizer may schedule publication");
  }

  if (currentStatus !== "DRAFT") {
    errors.push(`Only DRAFT events can be scheduled for publication; current status is ${currentStatus}`);
  }

  if (!publishAt) {
    errors.push("publishAt is required");
  }

  let publishAtMs = null;
  if (publishAt) {
    publishAtMs = Date.parse(publishAt);
    if (Number.isNaN(publishAtMs)) {
      errors.push("publishAt must be a valid ISO-8601 timestamp");
      publishAtMs = null;
    } else if (publishAtMs <= nowMs) {
      errors.push("publishAt must be in the future");
      publishAtMs = null;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    publishAtMs
  };
}

// ---------------------------------------------------------------------------
// Scheduling record
// ---------------------------------------------------------------------------

/**
 * Builds the scheduling record to persist alongside the draft.
 * The host service stores this and polls / uses a cron job to fire transitions.
 *
 * @param {object} params
 * @param {string} params.eventId
 * @param {string} params.organizerId
 * @param {string} params.publishAt  Validated ISO-8601 timestamp.
 * @param {number} [params.nowMs]
 * @returns {object}
 */
export function buildScheduledPublishRecord({
  eventId,
  organizerId,
  publishAt,
  nowMs = Date.now()
}) {
  return {
    eventId,
    organizerId,
    publishAt,
    scheduledAt: new Date(nowMs).toISOString(),
    status: "PENDING"
  };
}

// ---------------------------------------------------------------------------
// Due-check
// ---------------------------------------------------------------------------

/**
 * Returns the subset of schedule records that are past their `publishAt` time
 * and are still in PENDING status — i.e. ready to be published now.
 *
 * @param {Array<{ eventId: string, publishAt: string, status: string }>} records
 * @param {number} [nowMs]
 * @returns {Array}
 */
export function pickDueScheduledPublications(records, nowMs = Date.now()) {
  return records.filter(
    (record) =>
      record.status === "PENDING" && Date.parse(record.publishAt) <= nowMs
  );
}

// ---------------------------------------------------------------------------
// Event payload
// ---------------------------------------------------------------------------

/**
 * Builds the `event.scheduled_publish_triggered` domain event payload emitted
 * when the scheduler fires the transition.
 *
 * @param {object} params
 * @param {string} params.eventId
 * @param {string} params.organizerId
 * @param {string} params.publishAt  The original scheduled time.
 * @param {number} [params.nowMs]
 * @returns {object}
 */
export function buildScheduledPublishTriggeredEvent({
  eventId,
  organizerId,
  publishAt,
  nowMs = Date.now()
}) {
  return {
    type: "event.scheduled_publish_triggered",
    eventId,
    organizerId,
    scheduledPublishAt: publishAt,
    triggeredAt: new Date(nowMs).toISOString()
  };
}

// ---------------------------------------------------------------------------
// Cancellation
// ---------------------------------------------------------------------------

/**
 * Validates a request to cancel a pending scheduled publication.
 *
 * @param {object} params
 * @param {string} params.organizerId
 * @param {string} params.recordOwnerId  organizerId on the schedule record.
 * @param {string} params.recordStatus   Current status of the schedule record.
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateCancelScheduledPublish({
  organizerId,
  recordOwnerId,
  recordStatus
}) {
  const errors = [];

  if (organizerId !== recordOwnerId) {
    errors.push("Only the owning organizer may cancel a scheduled publication");
  }

  if (recordStatus !== "PENDING") {
    errors.push(`Scheduled publication cannot be cancelled — current status is ${recordStatus}`);
  }

  return { valid: errors.length === 0, errors };
}
