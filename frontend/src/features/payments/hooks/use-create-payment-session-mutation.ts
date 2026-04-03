"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createPaymentSession } from "../api/create-payment-session";

export function useCreatePaymentSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPaymentSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-registrations"] });
    }
  });
}
