"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { NormalizedApiError } from "@/lib/api/error-handler";

import { getOrganizerEvents } from "../api/get-organizer-events";
import type {
  OrganizerEventsQueryFilters,
  OrganizerEventsResult
} from "../types/event.types";

export function useOrganizerEventsQuery(
  filters: OrganizerEventsQueryFilters = {},
  enabled = true
): UseQueryResult<OrganizerEventsResult, NormalizedApiError> {
  return useQuery({
    queryKey: ["organizer-events", filters],
    queryFn: () => getOrganizerEvents(filters),
    enabled
  });
}
