"use client";

import { useMutation } from "@tanstack/react-query";

import { login } from "../api/login";
import { clearSessionExpired, persistSession } from "../utils/auth-storage";

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      clearSessionExpired();
      persistSession(session.accessToken, session.user);
    }
  });
}
