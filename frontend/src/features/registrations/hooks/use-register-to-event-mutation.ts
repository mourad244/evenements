"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { registerToEvent } from "../api/register-to-event";

export function useRegisterToEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerToEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
    }
  });
}
