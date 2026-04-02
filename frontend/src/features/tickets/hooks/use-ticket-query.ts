"use client";

import { useQuery } from "@tanstack/react-query";

import { getTicket } from "../api/get-ticket";

export function useTicketQuery(ticketId: string | undefined) {
  return useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicket(ticketId ?? ""),
    enabled: Boolean(ticketId)
  });
}
