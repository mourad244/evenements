import { useQuery } from "@tanstack/react-query";

import { getToken } from "@/lib/auth/get-token";

import { getProfile } from "../api/update-profile";

export function useProfileQuery() {
  const token = getToken();
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: Boolean(token),
    staleTime: 60_000
  });
}
