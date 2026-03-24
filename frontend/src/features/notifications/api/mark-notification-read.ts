import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { NotificationItem } from "../types/notification.types";

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

export async function markNotificationRead(notificationId: string): Promise<NotificationItem> {
  try {
    const response = await apiClient.patch(
      ENDPOINTS.notifications.markRead(notificationId)
    );
    const payload = response.data?.data || response.data || {};
    return normalizeNotification(payload as Record<string, unknown>);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
