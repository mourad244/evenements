import type { NotificationItem } from "../types/notification.types";

export async function getNotifications(): Promise<NotificationItem[]> {
  return [
    {
      id: "notif-1",
      title: "Registration confirmed",
      channel: "EMAIL",
      createdAt: "2026-03-10T09:00:00.000Z"
    }
  ];
}
