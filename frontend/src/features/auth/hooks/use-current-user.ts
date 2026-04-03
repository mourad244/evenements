"use client";

import { useQuery } from "@tanstack/react-query";

import { getToken } from "@/lib/auth/get-token";

import { getMe } from "../api/me";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: getMe,
    retry: false,
    enabled: Boolean(getToken()),
    staleTime: 5 * 60 * 1000 // 5 minutes — prevents immediate background refetch after login setQueryData
  });
}
