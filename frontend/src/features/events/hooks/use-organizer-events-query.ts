"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { NormalizedApiError } from "@/lib/api/error-handler";

import { getOrganizerEvents } from "../api/get-organizer-events";
import type { EventItem } from "../types/event.types";

export function useOrganizerEventsQuery(
  enabled = true
): UseQueryResult<EventItem[], NormalizedApiError> {
  return useQuery({
    queryKey: ["organizer-events"],
    queryFn: getOrganizerEvents,
    enabled,
    staleTime: 2 * 60 * 1000
  });
}
