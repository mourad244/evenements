import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import { mapEventFiltersToCatalogParams, mapEventResponse } from "../utils/event-mappers";
import type { EventFilters, EventItem } from "../types/event.types";

export async function getEvents(filters?: EventFilters): Promise<EventItem[]> {
  try {
    const response = await apiClient.get(ENDPOINTS.events.list, {
      params: mapEventFiltersToCatalogParams(filters)
    });
    const items = response.data?.data?.items || response.data?.data || response.data || [];
    return items.map(mapEventResponse);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
