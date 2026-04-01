import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type {
  NotificationsQuery,
  NotificationsResult
} from "../types/notification.types";
import { mapNotificationItem } from "../utils/map-notification-item";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

function normalizePositiveInt(value: number | undefined, fallback: number) {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : fallback;
}

export async function getNotifications(
  query: NotificationsQuery = {}
): Promise<NotificationsResult> {
  try {
    const page = normalizePositiveInt(query.page, DEFAULT_PAGE);
    const pageSize = normalizePositiveInt(query.pageSize, DEFAULT_PAGE_SIZE);

    const response = await apiClient.get(ENDPOINTS.notifications.list, {
      params: { page, pageSize }
    });

    const payload = response.data.data || {};
    const items = Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload)
        ? payload
        : [];
    const total = normalizePositiveInt(payload.total, items.length);
    const normalizedPage = normalizePositiveInt(payload.page, page);
    const normalizedPageSize = normalizePositiveInt(payload.pageSize, pageSize);

    return {
      items: items.map((item: Record<string, unknown>) => mapNotificationItem(item)),
      pagination: {
        page: normalizedPage,
        pageSize: normalizedPageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / normalizedPageSize))
      }
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}
