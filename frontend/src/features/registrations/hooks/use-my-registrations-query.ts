"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { NormalizedApiError } from "@/lib/api/error-handler";

import { getMyRegistrations } from "../api/get-my-registrations";
import type {
  ParticipantHistoryQuery,
  ParticipantHistoryResult
} from "../types/registration.types";

export function useMyRegistrationsQuery(
  query: ParticipantHistoryQuery = {},
  enabled = true
): UseQueryResult<ParticipantHistoryResult, NormalizedApiError> {
  return useQuery({
    queryKey: ["my-registrations", query],
    queryFn: () => getMyRegistrations(query),
    enabled,
    staleTime: 60 * 1000
  });
}
