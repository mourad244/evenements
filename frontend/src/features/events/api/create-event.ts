import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import { mapEventResponse, mapUpsertEventToDraftPayload } from "../utils/event-mappers";
import type { UpsertEventInput } from "../types/event.types";

export async function createEvent(payload: UpsertEventInput) {
  try {
    const response = await apiClient.post(
      ENDPOINTS.events.organizerCreate,
      mapUpsertEventToDraftPayload(payload)
    );
    return mapEventResponse(response.data?.data || response.data || {});
  } catch (error) {
    throw normalizeApiError(error);
  }
}
