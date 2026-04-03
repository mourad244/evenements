"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { NormalizedApiError } from "@/lib/api/error-handler";

import type { EventFilters } from "../types/event.types";
import { getEvents } from "../api/get-events";

export function useEventsQuery(
  filters?: EventFilters
): UseQueryResult<ReturnType<typeof getEvents> extends Promise<infer T> ? T : never, NormalizedApiError> {
  return useQuery({
    queryKey: ["events", filters],
    queryFn: () => getEvents(filters),
    staleTime: 2 * 60 * 1000
  });
}
