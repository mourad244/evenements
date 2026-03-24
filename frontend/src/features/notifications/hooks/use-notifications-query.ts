"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { NormalizedApiError } from "@/lib/api/error-handler";

import { getNotifications } from "../api/get-notifications";
import type {
  NotificationListResult,
  NotificationsQuery
} from "../types/notification.types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function normalizePositiveInt(value: number | undefined, fallback: number) {
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : fallback;
}

export function useNotificationsQuery(
  query: NotificationsQuery = {}
): UseQueryResult<NotificationListResult, NormalizedApiError> {
  const page = normalizePositiveInt(query.page, DEFAULT_PAGE);
  const pageSize = normalizePositiveInt(query.pageSize, DEFAULT_PAGE_SIZE);

  return useQuery({
    queryKey: ["notifications", page, pageSize],
    queryFn: () => getNotifications({ page, pageSize })
  });
}
