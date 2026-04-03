"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { NormalizedApiError } from "@/lib/api/error-handler";

import { getOrganizerEventRegistrations } from "../api/get-organizer-event-registrations";
import type { OrganizerEventRegistrationsView } from "../types/registration.types";

export function useOrganizerEventRegistrationsQuery(
  eventId: string
): UseQueryResult<OrganizerEventRegistrationsView, NormalizedApiError> {
  return useQuery({
    queryKey: ["organizer-event-registrations", eventId],
    queryFn: () => getOrganizerEventRegistrations(eventId),
    enabled: Boolean(eventId),
    staleTime: 60 * 1000
  });
}
