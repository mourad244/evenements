const EXPORT_STATUS_LABELS = {
  READY: "Export ready",
  RUNNING: "Export in progress",
  FAILED: "Export failed",
  UNKNOWN: "Export status unavailable"
};

const EXPORT_STATUS_ACTIONS = {
  READY: "DOWNLOAD",
  RUNNING: "WAIT",
  FAILED: "RETRY",
  UNKNOWN: "NONE"
};

const EXPORT_STATUS_MESSAGES = {
  READY: "Download the latest export file.",
  RUNNING: "Export is being generated. Please retry shortly.",
  FAILED: "Export failed. Please retry.",
  UNKNOWN: "Export status is unavailable."
};

export function normalizeExportStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return normalized || "UNKNOWN";
}

export function resolveExportCta(
  exportState = {}
) {
  const status = normalizeExportStatus(exportState.status);
  const action = EXPORT_STATUS_ACTIONS[status] || "NONE";
  return {
    status,
    label: EXPORT_STATUS_LABELS[status] || EXPORT_STATUS_LABELS.UNKNOWN,
    message: EXPORT_STATUS_MESSAGES[status] || EXPORT_STATUS_MESSAGES.UNKNOWN,
    action,
    exportUrl: action === "DOWNLOAD" ? exportState.exportUrl || null : null
  };
}

export function mapOrganizerRegistrantRow(registrant = {}) {
  return {
    registrationId: registrant.registrationId,
    participantName: registrant.participantName,
    status: String(registrant.status || "").toUpperCase(),
    ticketRef: registrant.ticketRef || null
  };
}
