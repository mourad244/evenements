const STATUS_CONFIG = {
  PENDING: {
    label: "PENDING",
    description: "Notification queued or awaiting delivery.",
    tone: "info",
    filterable: true
  },
  SENT: {
    label: "SENT",
    description: "Notification delivered successfully.",
    tone: "success",
    filterable: true
  },
  FAILED: {
    label: "FAILED",
    description: "Notification delivery failed.",
    tone: "danger",
    filterable: true
  },
  SIMULATED: {
    label: "SIMULATED",
    description: "SMS simulated (no external delivery).",
    tone: "warning",
    filterable: true
  },
  UNKNOWN: {
    label: "UNKNOWN",
    description: "Status unavailable.",
    tone: "muted",
    filterable: false
  }
};

export function normalizeNotificationStatus(status) {
  const normalized = String(status || "").trim().toUpperCase();
  return normalized || "UNKNOWN";
}

export function mapNotificationStatusToUx(status) {
  const normalized = normalizeNotificationStatus(status);
  return STATUS_CONFIG[normalized] || STATUS_CONFIG.UNKNOWN;
}

export function listNotificationStatusFilters() {
  return Object.values(STATUS_CONFIG)
    .filter((entry) => entry.filterable)
    .map((entry) => ({
      value: entry.label,
      label: entry.label,
      description: entry.description,
      tone: entry.tone
    }));
}

export function isSimulatedNotification(status) {
  return normalizeNotificationStatus(status) === "SIMULATED";
}
