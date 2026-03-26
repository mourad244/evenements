import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import { mapEventResponse, mapUpsertEventToDraftPayload } from "../utils/event-mappers";
import type { UpsertEventInput } from "../types/event.types";

export async function updateEvent(eventId: string, payload: UpsertEventInput) {
  try {
    const response = await apiClient.patch(
      ENDPOINTS.events.organizerDetails(eventId),
      mapUpsertEventToDraftPayload(payload)
    );
    return mapEventResponse(response.data?.data || response.data || {});
  } catch (error) {
    throw normalizeApiError(error);
  }
}
