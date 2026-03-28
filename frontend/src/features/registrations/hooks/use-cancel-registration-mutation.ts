"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cancelRegistration } from "../api/cancel-registration";

export function useCancelRegistrationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelRegistration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
    }
  });
}
