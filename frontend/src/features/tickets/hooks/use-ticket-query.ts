"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { NormalizedApiError } from "@/lib/api/error-handler";

import { getTicket } from "../api/get-ticket";
import type { TicketView } from "../types/ticket.types";

export function useTicketQuery(
  ticketId: string | undefined
): UseQueryResult<TicketView, NormalizedApiError> {
  return useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicket(String(ticketId)),
    enabled: Boolean(ticketId)
  });
}
