import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import { mapEventResponse } from "../utils/event-mappers";

export async function getOrganizerEventById(eventId: string) {
  try {
    const response = await apiClient.get(ENDPOINTS.events.organizerDetails(eventId));
    return mapEventResponse(response.data?.data || response.data || {});
  } catch (error) {
    throw normalizeApiError(error);
  }
}
