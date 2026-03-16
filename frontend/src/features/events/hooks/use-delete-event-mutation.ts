"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteEvent } from "../api/delete-event";

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    }
  });
}
