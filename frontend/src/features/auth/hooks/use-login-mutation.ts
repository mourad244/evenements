"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login } from "../api/login";
import { clearSessionExpired, persistSession } from "../utils/auth-storage";

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      clearSessionExpired();
      persistSession({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken
      });
      queryClient.setQueryData(["current-user"], session.user);
    }
  });
}
