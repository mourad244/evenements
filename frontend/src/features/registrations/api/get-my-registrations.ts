import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { normalizePositiveInt } from "@/lib/utils/normalize-positive-int";

import type {
  ParticipantHistoryQuery,
  ParticipantHistoryResult,
  RegistrationItem
} from "../types/registration.types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function mapRegistrationItem(item: Record<string, unknown>): RegistrationItem {
  const rawPrice =
    typeof item.eventPrice === "number"
      ? item.eventPrice
      : typeof item.price === "number"
        ? item.price
        : item.eventPrice
          ? Number(item.eventPrice)
          : item.price
            ? Number(item.price)
            : null;
  const rawCurrency = item.eventCurrency ?? item.currency ?? null;

  return {
    id: String(item.registrationId || item.id || "registration-placeholder"),
    eventId: String(item.eventId || ""),
    eventTitle: String(item.eventTitle || "Untitled event"),
    status: String(
      item.registrationStatus || item.status || "CONFIRMED"
    ) as RegistrationItem["status"],
    eventDate: String(item.eventStartAt || item.updatedAt || new Date().toISOString()),
    eventCity: item.eventCity ? String(item.eventCity) : null,
    eventPrice:
      typeof rawPrice === "number" && Number.isFinite(rawPrice) ? rawPrice : null,
    eventCurrency: rawCurrency ? String(rawCurrency) : null,
    waitlistPosition:
      typeof item.waitlistPosition === "number"
        ? item.waitlistPosition
        : item.waitlistPosition
          ? Number(item.waitlistPosition)
          : null,
    canDownloadTicket: Boolean(item.canDownloadTicket),
    ticketId: item.ticketId ? String(item.ticketId) : null,
    ticketFormat: item.ticketFormat ? String(item.ticketFormat) : null,
    updatedAt: item.updatedAt ? String(item.updatedAt) : null
  };
}

export async function getMyRegistrations(
  query: ParticipantHistoryQuery = {}
): Promise<ParticipantHistoryResult> {
  try {
    const page = normalizePositiveInt(query.page, DEFAULT_PAGE);
    const pageSize = normalizePositiveInt(query.pageSize, DEFAULT_PAGE_SIZE);
    const params: Record<string, string | number> = {
      page,
      pageSize
    };

    if (query.status && query.status !== "ALL") {
      params.status = query.status;
    }

    const response = await apiClient.get(ENDPOINTS.registrations.mine, { params });
    const items = response.data.data?.items || response.data.data || [];

    return {
      items: items.map(mapRegistrationItem),
      pagination: {
        page: normalizePositiveInt(response.data.data?.page, page),
        pageSize: normalizePositiveInt(response.data.data?.pageSize, pageSize),
        total: normalizePositiveInt(response.data.data?.total, 0),
        totalPages: Math.max(
          1,
          Math.ceil(
            normalizePositiveInt(response.data.data?.total, 0) /
              normalizePositiveInt(response.data.data?.pageSize, pageSize)
          )
        )
      }
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}
