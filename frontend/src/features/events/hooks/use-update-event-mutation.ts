"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateEvent } from "../api/update-event";
import type { UpsertEventInput } from "../types/event.types";

export function useUpdateEventMutation(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertEventInput) => updateEvent(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
    }
  });
}
