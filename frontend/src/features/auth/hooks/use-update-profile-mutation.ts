"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateProfile } from "../api/profile";
import type { UpdateProfileInput, UserProfile } from "../types/auth.types";

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileInput) => updateProfile(payload),
    onSuccess: (profile: UserProfile) => {
      queryClient.setQueryData(["profile"], profile);
      queryClient.setQueryData(["current-user"], {
        id: profile.id,
        email: profile.email,
        fullName: profile.displayName || profile.fullName || profile.name,
        role: profile.role
      });
    }
  });
}
