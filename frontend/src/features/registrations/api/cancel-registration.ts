import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

export async function cancelRegistration(registrationId: string) {
  try {
    const response = await apiClient.post(
      ENDPOINTS.registrations.cancel(registrationId)
    );
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
