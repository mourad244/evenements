"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { NormalizedApiError } from "@/lib/api/error-handler";
import { getToken } from "@/lib/auth/get-token";

import { getProfile } from "../api/profile";
import type { UserProfile } from "../types/auth.types";

export function useProfileQuery(): UseQueryResult<UserProfile, NormalizedApiError> {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: Boolean(getToken())
  });
}
