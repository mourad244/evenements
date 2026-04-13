"use client";

import { useQuery } from "@tanstack/react-query";

import { getOrganizerEventById } from "../api/get-organizer-event-by-id";

export function useOrganizerEventDetailsQuery(eventId: string) {
  return useQuery({
    queryKey: ["organizer-event", eventId],
    queryFn: () => getOrganizerEventById(eventId),
    enabled: Boolean(eventId)
  });
}
