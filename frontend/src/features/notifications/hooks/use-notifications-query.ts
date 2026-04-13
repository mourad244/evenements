"use client";

import { useQuery } from "@tanstack/react-query";

import { getNotifications } from "../api/get-notifications";

export function useNotificationsQuery() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications
  });
}
