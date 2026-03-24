"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markNotificationRead } from "../api/mark-notification-read";
import type { NotificationItem } from "../types/notification.types";

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (updated) => {
      queryClient.setQueriesData({ queryKey: ["notifications"] }, (current) => {
        if (!current) return current;
        if (Array.isArray(current)) {
          return current.map((item) =>
            item.notificationId === updated.notificationId ? updated : item
          );
        }
        if (
          typeof current === "object" &&
          current !== null &&
          "items" in current
        ) {
          const items = Array.isArray((current as { items?: unknown }).items)
            ? (current as { items: NotificationItem[] }).items
            : null;

          if (!items) return current;

          return {
            ...(current as { items: NotificationItem[] }),
            items: items.map((item) =>
              item.notificationId === updated.notificationId ? updated : item
            )
          };
        }
        return current;
      });
    }
  });
}
