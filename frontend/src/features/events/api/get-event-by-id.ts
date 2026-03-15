import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import { mapEventResponse } from "../utils/event-mappers";

export async function getEventById(eventId: string) {
  try {
    const response = await apiClient.get(ENDPOINTS.events.details(eventId));
    return mapEventResponse(response.data?.data || response.data || {});
  } catch (error) {
    throw normalizeApiError(error);
  }
}
