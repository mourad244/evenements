import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { EventRegistrationPayload } from "../types/registration.types";

export async function registerToEvent(payload: EventRegistrationPayload) {
  try {
    const response = await apiClient.post(ENDPOINTS.registrations.create, payload);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
