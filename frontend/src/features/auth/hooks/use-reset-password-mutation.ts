"use client";

import { useMutation } from "@tanstack/react-query";

import { resetPassword } from "../api/reset-password";

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: resetPassword
  });
}
