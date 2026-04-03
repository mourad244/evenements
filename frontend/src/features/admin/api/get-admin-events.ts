import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mapEventResponse } from "@/features/events/utils/event-mappers";

import type { AdminEvent } from "../types/admin.types";

export async function getAdminEvents(): Promise<AdminEvent[]> {
  try {
    const response = await apiClient.get(ENDPOINTS.admin.events);
    const items =
      response.data?.data?.items ||
      response.data?.data ||
      response.data ||
      [];
    return items.map(mapEventResponse);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
