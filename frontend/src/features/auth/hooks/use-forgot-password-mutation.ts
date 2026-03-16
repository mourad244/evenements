"use client";

import { useMutation } from "@tanstack/react-query";

import { forgotPassword } from "../api/forgot-password";

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: forgotPassword
  });
}
