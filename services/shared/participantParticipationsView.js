import { downloadTicketWithUx } from "./ticketDownloadUx.js";
import { mapParticipationRow } from "./participantTicketUi.js";

export function buildParticipantParticipationsViewModel({
  historyResponse,
  actor = "participant"
} = {}) {
  const items = Array.isArray(historyResponse?.items)
    ? historyResponse.items
    : [];

  return {
    items: items.map((item) => mapParticipationRow(item, { actor })),
    pagination: normalizePagination(historyResponse?.pagination),
    correlationId: normalizeOptionalString(historyResponse?.correlationId)
  };
}

export async function handleParticipantTicketDownload({
  participation,
  accessToken,
  correlationId,
  fetchImpl,
  actor = "participant"
} = {}) {
  return downloadTicketWithUx({
    registration: participation,
    actor,
    ticketId: participation?.ticketId,
    accessToken,
    correlationId,
    fetchImpl
  });
}

function normalizePagination(pagination) {
  const page = normalizePositiveInt(pagination?.page, 1);
  const pageSize = normalizePositiveInt(pagination?.pageSize, 20);
  const totalItems = normalizePositiveInt(pagination?.totalItems, 0);
  const totalPages = normalizePositiveInt(
    pagination?.totalPages,
    Math.max(1, Math.ceil(totalItems / Math.max(pageSize, 1)))
  );

  return {
    page,
    pageSize,
    totalItems,
    totalPages
  };
}

function normalizePositiveInt(value, fallback) {
  const numeric = Number.parseInt(value, 10);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : fallback;
}

function normalizeOptionalString(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}
