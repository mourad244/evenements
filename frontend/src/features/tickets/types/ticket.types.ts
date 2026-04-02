export type TicketStatus = "ISSUED" | "PENDING" | "CANCELLED" | string;

export type Ticket = {
  ticketId: string;
  registrationId: string;
  eventId: string;
  participantId: string;
  ticketRef?: string | null;
  ticketFormat?: string | null;
  status: TicketStatus;
  eventTitle?: string | null;
  eventCity?: string | null;
  eventStartAt?: string | null;
  eventDate?: string | null;
  participantName?: string | null;
  issuedAt?: string | null;
  updatedAt?: string | null;
};
