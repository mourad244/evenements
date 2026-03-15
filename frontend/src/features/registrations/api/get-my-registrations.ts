import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { RegistrationItem } from "../types/registration.types";

export async function getMyRegistrations(): Promise<RegistrationItem[]> {
  try {
    const response = await apiClient.get(ENDPOINTS.registrations.mine);
    const items = response.data.data?.items || response.data.data || [];
    return items.map((item: Record<string, unknown>) => ({
      id: String(item.registrationId || item.id || "registration-placeholder"),
      eventId: String(item.eventId || ""),
      eventTitle: String(item.eventTitle || "Untitled event"),
      status: String(item.registrationStatus || item.status || "CONFIRMED") as RegistrationItem["status"],
      ticketReady: Boolean(item.canDownloadTicket),
      eventDate: String(item.eventStartAt || item.updatedAt || new Date().toISOString())
    }));
  } catch (error) {
    throw normalizeApiError(error);
  }
}
