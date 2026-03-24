import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { TicketView } from "../types/ticket.types";

function normalizeTicket(input: Record<string, unknown>): TicketView {
  return {
    ticketId: String(input.ticketId || input.id || ""),
    registrationId: String(input.registrationId || ""),
    eventId: String(input.eventId || ""),
    ticketRef: input.ticketRef ? String(input.ticketRef) : null,
    ticketFormat: input.ticketFormat
      ? String(input.ticketFormat)
      : input.format
        ? String(input.format)
        : null,
    status: String(input.status || input.ticketStatus || "UNKNOWN"),
    payload: (input.payload as Record<string, unknown> | string | null) || null,
    issuedAt: input.issuedAt ? String(input.issuedAt) : null,
    updatedAt: input.updatedAt ? String(input.updatedAt) : null
  };
}

export async function getTicket(ticketId: string): Promise<TicketView> {
  try {
    const response = await apiClient.get(ENDPOINTS.tickets.details(ticketId));
    const payload = response.data?.data || response.data || {};
    return normalizeTicket(payload as Record<string, unknown>);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
