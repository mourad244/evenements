export type TicketView = {
  ticketId: string;
  registrationId: string;
  eventId: string;
  ticketRef: string | null;
  ticketFormat: string | null;
  status: string;
  payload: Record<string, unknown> | string | null;
  issuedAt: string | null;
  updatedAt: string | null;
};
