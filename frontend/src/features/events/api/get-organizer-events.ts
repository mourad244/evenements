import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import { mapEventResponse } from "../utils/event-mappers";
import type {
  OrganizerEventsQueryFilters,
  OrganizerEventsResult
} from "../types/event.types";

export async function getOrganizerEvents(
  filters: OrganizerEventsQueryFilters = {}
): Promise<OrganizerEventsResult> {
  try {
    const response = await apiClient.get(ENDPOINTS.events.organizerList, {
      params: {
        status: filters.status || undefined,
        theme: filters.theme || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
        page: filters.page || undefined,
        pageSize: filters.pageSize || undefined
      }
    });
    const data = response.data?.data || response.data || {};
    const items = data.items || [];
    return {
      items: items.map(mapEventResponse),
      page: data.page || filters.page || 1,
      pageSize: data.pageSize || filters.pageSize || items.length || 20,
      total: data.total || 0,
      counts: data.counts || {
        total: data.total || 0,
        draft: 0,
        published: 0,
        full: 0,
        closed: 0,
        archived: 0,
        cancelled: 0
      }
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}
