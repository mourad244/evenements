"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markNotificationRead } from "../api/mark-notification-read";
import type { NotificationsResult } from "../types/notification.types";

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (updated) => {
      queryClient.setQueriesData(
        { queryKey: ["notifications"] },
        (oldData: NotificationsResult | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            items: oldData.items.map((item) =>
              item.id === updated.id ? { ...item, ...updated } : item
            )
          };
        }
      );
    }
  });
}
