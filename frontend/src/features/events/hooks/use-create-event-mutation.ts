"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createEvent } from "../api/create-event";

export function useCreateEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
    }
  });
}
