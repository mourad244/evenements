import type { NotificationItem } from "../types/notification.types";

export function mapNotificationItem(
  item: Record<string, unknown>
): NotificationItem {
  return {
    id: String(item.notificationId || item.id || "notification-placeholder"),
    title: String(item.title || "Notification update"),
    message: String(item.message || "Details are available in your activity feed."),
    type: String(item.notificationType || item.type || "UPDATE"),
    isRead: Boolean(item.isRead),
    createdAt: String(item.createdAt || new Date().toISOString()),
    readAt: item.readAt ? String(item.readAt) : null
  };
}
