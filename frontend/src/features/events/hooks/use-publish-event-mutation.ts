"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { publishEvent } from "../api/publish-event";

export function usePublishEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishEvent,
    onSuccess: (_data, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["organizer-event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    }
  });
}
