"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { NormalizedApiError } from "@/lib/api/error-handler";

import { getEventById } from "../api/get-event-by-id";
import type { EventItem } from "../types/event.types";

export function useEventDetailsQuery(
  eventId: string
): UseQueryResult<EventItem, NormalizedApiError> {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEventById(eventId),
    enabled: Boolean(eventId)
  });
}
