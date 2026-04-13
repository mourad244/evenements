/**
 * notificationEmailTemplates.js
 *
 * Pure template-rendering module for transactional email notifications
 * (ticket N01.2).  No I/O, no DB — safe to unit-test in isolation.
 *
 * Supported templateIds (defined in N01.1 catalog):
 *   EMAIL_REGISTRATION_CONFIRMED
 *   EMAIL_REGISTRATION_WAITLISTED
 *   EMAIL_REGISTRATION_PROMOTED
 *   EMAIL_EVENT_REMINDER
 *   EMAIL_EVENT_CANCELLED
 */

export const TEMPLATE_IDS = Object.freeze({
  REGISTRATION_CONFIRMED:  "EMAIL_REGISTRATION_CONFIRMED",
  REGISTRATION_WAITLISTED: "EMAIL_REGISTRATION_WAITLISTED",
  REGISTRATION_PROMOTED:   "EMAIL_REGISTRATION_PROMOTED",
  EVENT_REMINDER:          "EMAIL_EVENT_REMINDER",
  EVENT_CANCELLED:         "EMAIL_EVENT_CANCELLED"
});

const VALID_TEMPLATE_IDS = new Set(Object.values(TEMPLATE_IDS));

/**
 * Validate that all required variables are present for a given templateId.
 *
 * @param {string} templateId
 * @param {object} variables
 * @returns {{ valid: boolean, missing: string[] }}
 */
export function validateTemplateVariables(templateId, variables) {
  const vars = variables || {};
  const missing = [];

  // Common required fields for all templates
  const common = ["recipientUserId", "recipientEmail", "eventId", "eventTitle", "correlationId"];
  for (const field of common) {
    if (!vars[field]) missing.push(field);
  }

  // Template-specific required fields
  switch (templateId) {
    case TEMPLATE_IDS.REGISTRATION_CONFIRMED:
    case TEMPLATE_IDS.REGISTRATION_WAITLISTED:
    case TEMPLATE_IDS.REGISTRATION_PROMOTED:
      if (!vars.registrationId) missing.push("registrationId");
      break;
    case TEMPLATE_IDS.EVENT_REMINDER:
      if (!vars.registrationId) missing.push("registrationId");
      if (!vars.eventDate) missing.push("eventDate");
      break;
    case TEMPLATE_IDS.EVENT_CANCELLED:
      // registrationId is optional for EVENT_CANCELLED per catalog
      break;
    default:
      return { valid: false, missing: [`Unknown templateId: "${templateId}"`] };
  }

  return { valid: missing.length === 0, missing };
}

/**
 * Render the subject line for a template.
 *
 * @param {string} templateId
 * @param {object} variables
 * @returns {string}
 */
export function renderSubject(templateId, variables) {
  const v = variables || {};
  const title = v.eventTitle || "your event";

  switch (templateId) {
    case TEMPLATE_IDS.REGISTRATION_CONFIRMED:
      return `Your registration for "${title}" is confirmed`;
    case TEMPLATE_IDS.REGISTRATION_WAITLISTED:
      return `You are on the waitlist for "${title}"`;
    case TEMPLATE_IDS.REGISTRATION_PROMOTED:
      return `Great news — you are off the waitlist for "${title}"`;
    case TEMPLATE_IDS.EVENT_REMINDER:
      return `Reminder: "${title}" is coming up`;
    case TEMPLATE_IDS.EVENT_CANCELLED:
      return `"${title}" has been cancelled`;
    default:
      return `Notification about "${title}"`;
  }
}

/**
 * Render the plain-text body for a template.
 * HTML rendering is out of scope for N01.2 (owner: notification-service).
 *
 * @param {string} templateId
 * @param {object} variables
 * @returns {string}
 */
export function renderTextBody(templateId, variables) {
  const v = variables || {};
  const firstName = v.firstName || "there";
  const title = v.eventTitle || "your event";

  switch (templateId) {
    case TEMPLATE_IDS.REGISTRATION_CONFIRMED: {
      const ticketLine = v.ticketDownloadUrl
        ? `\nDownload your ticket: ${v.ticketDownloadUrl}`
        : "";
      const dateLine = v.eventDate ? `\nEvent date: ${v.eventDate}` : "";
      const locationLine = v.eventLocation ? `\nLocation: ${v.eventLocation}` : "";
      return (
        `Hi ${firstName},\n\n` +
        `Your registration for "${title}" is confirmed.${dateLine}${locationLine}${ticketLine}\n\n` +
        `See you there!`
      );
    }

    case TEMPLATE_IDS.REGISTRATION_WAITLISTED: {
      const positionLine = v.waitlistPosition
        ? ` You are currently at position ${v.waitlistPosition} on the waitlist.`
        : "";
      return (
        `Hi ${firstName},\n\n` +
        `You are on the waitlist for "${title}".${positionLine}\n\n` +
        `We will notify you if a spot becomes available.`
      );
    }

    case TEMPLATE_IDS.REGISTRATION_PROMOTED: {
      const ticketLine = v.ticketDownloadUrl
        ? `\nDownload your ticket: ${v.ticketDownloadUrl}`
        : "";
      return (
        `Hi ${firstName},\n\n` +
        `Good news! A spot opened up and your registration for "${title}" is now confirmed.${ticketLine}\n\n` +
        `See you there!`
      );
    }

    case TEMPLATE_IDS.EVENT_REMINDER: {
      const dateLine = v.eventDate ? `\nDate: ${v.eventDate}` : "";
      const timeLine = v.eventTime ? `\nTime: ${v.eventTime}` : "";
      const locationLine = v.eventLocation ? `\nLocation: ${v.eventLocation}` : "";
      return (
        `Hi ${firstName},\n\n` +
        `This is a reminder that "${title}" is coming up soon.${dateLine}${timeLine}${locationLine}\n\n` +
        `We look forward to seeing you!`
      );
    }

    case TEMPLATE_IDS.EVENT_CANCELLED: {
      const reasonLine = v.cancelReasonCode
        ? `\nReason: ${v.cancelReasonCode}`
        : "";
      return (
        `Hi ${firstName},\n\n` +
        `We regret to inform you that "${title}" has been cancelled.${reasonLine}\n\n` +
        `We apologise for the inconvenience.`
      );
    }

    default:
      return `Hi ${firstName},\n\nYou have a notification about "${title}".`;
  }
}

/**
 * Build a complete notification message object ready for the email worker.
 *
 * @param {string} templateId
 * @param {object} variables
 * @returns {{
 *   templateId: string,
 *   channel: "EMAIL",
 *   recipientEmail: string,
 *   recipientUserId: string,
 *   subject: string,
 *   textBody: string,
 *   eventId: string,
 *   registrationId: string | null,
 *   correlationId: string,
 *   status: "PENDING"
 * }}
 */
export function buildNotificationMessage(templateId, variables) {
  const v = variables || {};
  return {
    templateId,
    channel: "EMAIL",
    recipientEmail: v.recipientEmail || "",
    recipientUserId: v.recipientUserId || "",
    subject: renderSubject(templateId, v),
    textBody: renderTextBody(templateId, v),
    eventId: v.eventId || "",
    registrationId: v.registrationId || null,
    correlationId: v.correlationId || "",
    status: "PENDING"
  };
}

/**
 * Check whether a given templateId is valid.
 *
 * @param {string} templateId
 * @returns {boolean}
 */
export function isValidTemplateId(templateId) {
  return VALID_TEMPLATE_IDS.has(templateId);
}
