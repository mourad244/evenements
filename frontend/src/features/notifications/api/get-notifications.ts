import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type {
  NotificationItem,
  NotificationListResult,
  NotificationsQuery
} from "../types/notification.types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function normalizePositiveInt(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function normalizeNonNegativeInt(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback;
}

function normalizeNotification(input: Record<string, unknown>): NotificationItem {
  const id = String(input.notificationId || input.id || "");
  return {
    id,
    notificationId: id,
    title: String(input.title || "Notification"),
    message: input.message ? String(input.message) : null,
    type: String(input.type || input.notificationType || "GENERAL"),
    isRead: Boolean(input.isRead),
    createdAt: String(input.createdAt || ""),
    readAt: input.readAt ? String(input.readAt) : null
  };
}

export async function getNotifications(
  query: NotificationsQuery = {}
): Promise<NotificationListResult> {
  try {
    const page = normalizePositiveInt(query.page, DEFAULT_PAGE);
    const pageSize = normalizePositiveInt(query.pageSize, DEFAULT_PAGE_SIZE);
    const response = await apiClient.get(ENDPOINTS.notifications.list, {
      params: { page, pageSize }
    });
    const payload = response.data?.data || response.data || {};
    const items = Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload)
        ? payload
        : [];

    return {
      items: items.map((item) => normalizeNotification(item)),
      page: normalizePositiveInt(payload.page, page),
      pageSize: normalizePositiveInt(payload.pageSize, pageSize),
      total: normalizeNonNegativeInt(payload.total, items.length)
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}
