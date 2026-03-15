"use client";

import { useQuery } from "@tanstack/react-query";

import { getOrganizerEvents } from "../api/get-organizer-events";

export function useOrganizerEventsQuery() {
  return useQuery({
    queryKey: ["organizer-events"],
    queryFn: getOrganizerEvents
  });
}
