import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

export async function deleteEvent(eventId: string) {
  try {
    await apiClient.delete(ENDPOINTS.events.organizerDetails(eventId));
  } catch (error) {
    throw normalizeApiError(error);
  }
}
