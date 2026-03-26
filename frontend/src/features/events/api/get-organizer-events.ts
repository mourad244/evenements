import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import { mapEventResponse } from "../utils/event-mappers";
import type { EventItem } from "../types/event.types";

export async function getOrganizerEvents(): Promise<EventItem[]> {
  try {
    const response = await apiClient.get(ENDPOINTS.events.organizerList);
    const items = response.data?.data?.items || response.data?.data || response.data || [];
    return items.map(mapEventResponse);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
