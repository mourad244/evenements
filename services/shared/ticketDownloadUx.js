import {
  downloadProtectedTicket,
  isTicketDownloadEligible
} from "./ticketDownloadHelper.js";

const COPY_BY_STATUS = {
  WAITLISTED: {
    participant: "Ticket unavailable while you are on the waitlist.",
    organizer: "Ticket unavailable because the participant is on the waitlist."
  },
  CANCELLED: {
    participant: "Ticket unavailable because this registration was cancelled.",
    organizer: "Ticket unavailable because this registration was cancelled."
  },
  PENDING: {
    participant: "Ticket is being generated. Please try again shortly.",
    organizer:
      "Ticket is being generated for this participant. Please retry shortly."
  },
  UNKNOWN: {
    participant: "Ticket status is currently unavailable.",
    organizer: "Ticket status is currently unavailable for this participant."
  }
};

const ERROR_COPY = {
  401: {
    participant: {
      message: "Your session has expired. Please sign in and retry.",
      action: "REDIRECT_LOGIN"
    },
    organizer: {
      message: "Session expired. Please sign in again before downloading.",
      action: "REDIRECT_LOGIN"
    }
  },
  403: {
    participant: {
      message: "You are not allowed to download this ticket.",
      action: "SHOW_FORBIDDEN"
    },
    organizer: {
      message:
        "You are not allowed to download this ticket for the selected registration.",
      action: "SHOW_FORBIDDEN"
    }
  },
  404: {
    participant: {
      message: "Ticket is not available yet for this registration.",
      action: "SHOW_UNAVAILABLE"
    },
    organizer: {
      message: "Ticket is not available yet for this participant.",
      action: "SHOW_UNAVAILABLE"
    }
  },
  502: {
    participant: {
      message: "Ticket service is temporarily unavailable. Please retry.",
      action: "RETRY"
    },
    organizer: {
      message:
        "Ticket service is temporarily unavailable for this participant. Please retry.",
      action: "RETRY"
    }
  },
  default: {
    participant: {
      message: "Ticket download failed. Please retry.",
      action: "SHOW_ERROR"
    },
    organizer: {
      message:
        "Ticket download failed for this participant. Please retry.",
      action: "SHOW_ERROR"
    }
  }
};

export function resolveTicketDownloadAvailability(
  registration = {},
  { actor = "participant" } = {}
) {
  if (isTicketDownloadEligible(registration)) {
    return {
      canDownload: true,
      message: null,
      action: "DOWNLOAD"
    };
  }

  const status = String(registration.registrationStatus || "UNKNOWN").toUpperCase();
  const ticketId = String(registration.ticketId || "").trim();
  const statusCopy =
    COPY_BY_STATUS[status] || COPY_BY_STATUS.UNKNOWN;

  if (
    status === "CONFIRMED" &&
    (registration.canDownloadTicket !== true || ticketId.length === 0)
  ) {
    return {
      canDownload: false,
      message: COPY_BY_STATUS.PENDING[actor] || COPY_BY_STATUS.PENDING.participant,
      action: "WAIT"
    };
  }

  return {
    canDownload: false,
    message: statusCopy[actor] || statusCopy.participant,
    action: "BLOCK"
  };
}

export function mapTicketDownloadResultToUx(
  result,
  { actor = "participant" } = {}
) {
  if (result?.ok) {
    return {
      ok: true,
      message:
        actor === "organizer"
          ? "Ticket downloaded for the selected participant."
          : "Ticket downloaded successfully.",
      action: "NONE",
      payload: result
    };
  }

  const status = Number(result?.status || 0);
  const copy =
    (ERROR_COPY[status] && ERROR_COPY[status][actor]) ||
    ERROR_COPY.default[actor] ||
    ERROR_COPY.default.participant;

  return {
    ok: false,
    status,
    code: result?.code || "DOWNLOAD_FAILED",
    retryable: Boolean(result?.retryable),
    message: copy.message,
    action: copy.action
  };
}

export async function downloadTicketWithUx({
  registration,
  actor = "participant",
  ...downloadArgs
}) {
  const availability = resolveTicketDownloadAvailability(registration, { actor });
  if (!availability.canDownload) {
    return {
      ok: false,
      blocked: true,
      message: availability.message,
      action: availability.action
    };
  }

  const rawResult = await downloadProtectedTicket(downloadArgs);
  const uxResult = mapTicketDownloadResultToUx(rawResult, { actor });
  if (uxResult.ok) {
    return {
      ...uxResult,
      blocked: false
    };
  }

  return {
    ...uxResult,
    blocked: false
  };
}
