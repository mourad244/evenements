import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import { mapEventResponse } from "../utils/event-mappers";

export async function publishEvent(eventId: string) {
  try {
    const response = await apiClient.post(ENDPOINTS.events.organizerPublish(eventId));
    return mapEventResponse(response.data?.data || response.data || {});
  } catch (error) {
    throw normalizeApiError(error);
  }
}
