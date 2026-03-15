"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { NormalizedApiError } from "@/lib/api/error-handler";

import { getMyRegistrations } from "../api/get-my-registrations";
import type { RegistrationItem } from "../types/registration.types";

export function useMyRegistrationsQuery(): UseQueryResult<RegistrationItem[], NormalizedApiError> {
  return useQuery({
    queryKey: ["my-registrations"],
    queryFn: getMyRegistrations
  });
}
