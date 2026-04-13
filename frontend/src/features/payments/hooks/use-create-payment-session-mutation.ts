"use client";

import { useMutation } from "@tanstack/react-query";

import { createPaymentSession } from "../api/create-payment-session";

export function useCreatePaymentSessionMutation() {
  return useMutation({ mutationFn: createPaymentSession });
}
