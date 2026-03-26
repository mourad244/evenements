"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminEvents } from "../api/get-admin-events";

export function useAdminEventsQuery() {
  return useQuery({
    queryKey: ["admin-events"],
    queryFn: getAdminEvents
  });
}
