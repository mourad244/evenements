import { resolveTicketDownloadAvailability } from "./ticketDownloadUx.js";

const STATUS_LABELS = {
  CONFIRMED: "Confirmed",
  WAITLISTED: "Waitlisted",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected"
};

export function normalizeRegistrationStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return normalized || "UNKNOWN";
}

export function resolveParticipationTicketCta(
  participation = {},
  { actor = "participant" } = {}
) {
  const eventStatus = String(participation.eventStatus || "")
    .trim()
    .toUpperCase();
  if (eventStatus === "CANCELLED") {
    return {
      show: false,
      action: "BLOCK",
      message:
        actor === "organizer"
          ? "Event cancelled. Ticket download is not available."
          : "Event cancelled. Your ticket is no longer available."
    };
  }

  const availability = resolveTicketDownloadAvailability(participation, {
    actor
  });

  if (availability.canDownload) {
    return {
      show: true,
      action: "DOWNLOAD",
      label: "Download ticket",
      ticketId: participation.ticketId
    };
  }

  return {
    show: false,
    action: availability.action,
    message: availability.message
  };
}

export function mapParticipationRow(participation = {}, options = {}) {
  const status = normalizeRegistrationStatus(
    participation.registrationStatus
  );
  return {
    registrationId: participation.registrationId,
    eventId: participation.eventId,
    eventTitle: participation.eventTitle,
    registrationStatus: status,
    statusLabel: STATUS_LABELS[status] || "Unknown",
    ticketCta: resolveParticipationTicketCta(participation, options)
  };
}
