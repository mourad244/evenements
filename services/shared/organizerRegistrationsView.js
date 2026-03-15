import {
  mapOrganizerRegistrantRow,
  resolveExportCta
} from "./organizerExportUi.js";

export function buildOrganizerRegistrationsViewModel({
  registrations = [],
  exportState = {},
  correlationId = null
} = {}) {
  return {
    rows: registrations.map(mapOrganizerRegistrantRow),
    exportCta: resolveExportCta(exportState),
    correlationId: normalizeOptionalString(correlationId)
  };
}

export function mergeOrganizerExportState({
  requestResponse,
  statusResponse
} = {}) {
  const requestData = requestResponse?.ok ? requestResponse.data || {} : {};
  const statusData = statusResponse?.ok ? statusResponse.data || {} : {};

  return {
    exportId:
      normalizeOptionalString(statusData.exportId) ||
      normalizeOptionalString(requestData.exportId),
    status:
      normalizeOptionalString(statusData.status) ||
      normalizeOptionalString(requestData.status) ||
      "UNKNOWN",
    exportUrl:
      normalizeOptionalString(statusData.exportUrl) ||
      normalizeOptionalString(requestData.exportUrl),
    format:
      normalizeOptionalString(statusData.format) ||
      normalizeOptionalString(requestData.format),
    expiresAt:
      normalizeOptionalString(statusData.expiresAt) ||
      normalizeOptionalString(requestData.expiresAt)
  };
}

function normalizeOptionalString(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}
