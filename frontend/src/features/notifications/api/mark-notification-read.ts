import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { NotificationItem } from "../types/notification.types";
import { mapNotificationItem } from "../utils/map-notification-item";

export async function markNotificationRead(
  notificationId: string
): Promise<NotificationItem> {
  try {
    const response = await apiClient.patch(
      ENDPOINTS.notifications.markRead(notificationId)
    );
    return mapNotificationItem(response.data.data || {});
  } catch (error) {
    throw normalizeApiError(error);
  }
}
