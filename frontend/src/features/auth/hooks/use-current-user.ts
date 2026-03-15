"use client";

import { useQuery } from "@tanstack/react-query";

import { getMe } from "../api/me";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: getMe,
    retry: false
  });
}
