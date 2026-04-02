import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { Ticket } from "../types/ticket.types";

function mapTicket(item: Record<string, unknown>): Ticket {
  return {
    ticketId: String(item.ticketId || ""),
    registrationId: String(item.registrationId || ""),
    eventId: String(item.eventId || ""),
    participantId: String(item.participantId || ""),
    ticketRef: item.ticketRef ? String(item.ticketRef) : null,
    ticketFormat: item.ticketFormat ? String(item.ticketFormat) : null,
    status: String(item.status || item.ticketStatus || "PENDING"),
    eventTitle: item.eventTitle ? String(item.eventTitle) : null,
    eventCity: item.eventCity ? String(item.eventCity) : null,
    eventStartAt: item.eventStartAt ? String(item.eventStartAt) : null,
    eventDate: item.eventDate ? String(item.eventDate) : null,
    participantName: item.participantName ? String(item.participantName) : null,
    issuedAt: item.issuedAt ? String(item.issuedAt) : null,
    updatedAt: item.updatedAt ? String(item.updatedAt) : null
  };
}

export async function getTicket(ticketId: string): Promise<Ticket> {
  try {
    const response = await apiClient.get(ENDPOINTS.tickets.get(ticketId));
    return mapTicket(response.data.data || {});
  } catch (error) {
    throw normalizeApiError(error);
  }
}
