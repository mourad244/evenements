/**
 * eventModerationHooks.js
 *
 * Pure business-rule module for event moderation hooks (ticket E06.3).
 * No I/O, no DB — safe to unit-test in isolation.
 *
 * Covers:
 *  - shouldSubmitForModeration: decides whether a publish triggers moderation
 *  - validateModerationTransition: guards state machine transitions
 *  - buildSubmittedForReviewEvent: domain event for queue submission
 *  - buildModerationResultEvent: domain event for approve/reject/request_changes
 */

// Statuses that are considered "editable by organizer" for re-submission
const EDITABLE_FOR_RESUBMIT = new Set(["CHANGES_REQUESTED"]);

// Statuses that can be submitted for publication
const PUBLISHABLE_STATUSES = new Set(["DRAFT", "CHANGES_REQUESTED"]);

// Valid moderation actions
const VALID_ACTIONS = new Set([
  "approve",
  "reject",
  "request_changes",
  "suspend",
  "reopen"
]);

// Allowed transitions: Map<fromStatus, Map<action, toStatus>>
const TRANSITION_MAP = new Map([
  [
    "PENDING_REVIEW",
    new Map([
      ["approve", "PUBLISHED"],
      ["reject", "CANCELLED"],
      ["request_changes", "CHANGES_REQUESTED"]
    ])
  ],
  [
    "CHANGES_REQUESTED",
    new Map([
      ["approve", "PUBLISHED"],
      ["reject", "CANCELLED"],
      ["reopen", "PENDING_REVIEW"] // admin can reopen
    ])
  ],
  [
    "PUBLISHED",
    new Map([["suspend", "SUSPENDED"]])
  ],
  [
    "SUSPENDED",
    new Map([["reopen", "PENDING_REVIEW"]])
  ]
]);

/**
 * Decide whether publishing this event should go through moderation.
 *
 * @param {{
 *   moderationEnabled: boolean,
 *   isFirstEventForOrganizer: boolean,
 *   organizerHasPriorRejection: boolean,
 *   pricingType: string,
 *   price: number,
 *   moderationThresholdPrice?: number
 * }} params
 * @returns {boolean}
 */
export function shouldSubmitForModeration({
  moderationEnabled,
  isFirstEventForOrganizer,
  organizerHasPriorRejection,
  pricingType,
  price,
  moderationThresholdPrice = 1000
}) {
  if (!moderationEnabled) return false;
  if (isFirstEventForOrganizer) return true;
  if (organizerHasPriorRejection) return true;
  if (pricingType === "PAID" && price > moderationThresholdPrice) return true;
  return false;
}

/**
 * Validate that a moderation action is allowed from the current event status.
 *
 * @param {{ currentStatus: string, action: string }} params
 * @returns {{ valid: boolean, nextStatus: string | null, error: string | null }}
 */
export function validateModerationTransition({ currentStatus, action }) {
  if (!VALID_ACTIONS.has(action)) {
    return {
      valid: false,
      nextStatus: null,
      error: `Unknown moderation action: "${action}"`
    };
  }

  const fromMap = TRANSITION_MAP.get(currentStatus);
  if (!fromMap) {
    return {
      valid: false,
      nextStatus: null,
      error: `No moderation transitions allowed from status "${currentStatus}"`
    };
  }

  const nextStatus = fromMap.get(action);
  if (!nextStatus) {
    return {
      valid: false,
      nextStatus: null,
      error: `Action "${action}" is not allowed from status "${currentStatus}"`
    };
  }

  return { valid: true, nextStatus, error: null };
}

/**
 * Determine whether an organizer can edit an event in moderation flow.
 * Organizers can only edit CHANGES_REQUESTED events (not PENDING_REVIEW).
 *
 * @param {string} status
 * @returns {boolean}
 */
export function isEditableInModerationFlow(status) {
  return EDITABLE_FOR_RESUBMIT.has(status);
}

/**
 * Determine whether a status allows re-submission (publish) by organizer.
 *
 * @param {string} status
 * @returns {boolean}
 */
export function canResubmit(status) {
  return PUBLISHABLE_STATUSES.has(status);
}

/**
 * Build the `event.submitted_for_review` domain event payload.
 *
 * @param {{ eventId: string, organizerId: string, caseId: string, nowMs: number }} params
 * @returns {object}
 */
export function buildSubmittedForReviewEvent({ eventId, organizerId, caseId, nowMs }) {
  return {
    type: "event.submitted_for_review",
    eventId,
    organizerId,
    caseId,
    submittedAt: new Date(nowMs).toISOString()
  };
}

/**
 * Build the domain event for a moderation decision
 * (approve → event.published, reject → event.rejected,
 *  request_changes → event.changes_requested).
 *
 * @param {{
 *   action: string,
 *   eventId: string,
 *   organizerId: string,
 *   reasonCode: string | null,
 *   caseId: string,
 *   nowMs: number
 * }} params
 * @returns {object}
 */
export function buildModerationResultEvent({
  action,
  eventId,
  organizerId,
  reasonCode,
  caseId,
  nowMs
}) {
  const timestamp = new Date(nowMs).toISOString();

  switch (action) {
    case "approve":
      return {
        type: "event.published",
        eventId,
        organizerId,
        publishedAt: timestamp
      };

    case "reject":
      return {
        type: "event.rejected",
        eventId,
        organizerId,
        reasonCode: reasonCode || "OTHER",
        caseId,
        rejectedAt: timestamp
      };

    case "request_changes":
      return {
        type: "event.changes_requested",
        eventId,
        organizerId,
        reasonCode: reasonCode || "OTHER",
        caseId,
        requestedAt: timestamp
      };

    case "suspend":
      return {
        type: "event.suspended",
        eventId,
        organizerId,
        reasonCode: reasonCode || "OTHER",
        caseId,
        suspendedAt: timestamp
      };

    default:
      return {
        type: `event.moderation.${action}`,
        eventId,
        organizerId,
        caseId,
        timestamp
      };
  }
}
