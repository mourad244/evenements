"use client";

import { useQuery } from "@tanstack/react-query";

import { getNotifications } from "../api/get-notifications";
import type { NotificationsQuery } from "../types/notification.types";

export function useNotificationsQuery(query: NotificationsQuery = {}) {
  return useQuery({
    queryKey: ["notifications", query.page ?? 1, query.pageSize ?? 10],
    queryFn: () => getNotifications(query)
  });
}
