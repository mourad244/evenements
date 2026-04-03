export type RegistrationStatus =
  | "CONFIRMED"
  | "WAITLISTED"
  | "CANCELLED"
  | "REJECTED";

export type RegistrationStatusFilter = RegistrationStatus | "ALL";

export type RegistrationItem = {
  id: string;
  eventId: string;
  eventTitle: string;
  status: RegistrationStatus;
  eventDate: string;
  eventCity: string | null;
  eventPrice?: number | null;
  eventCurrency?: string | null;
  waitlistPosition: number | null;
  canDownloadTicket: boolean;
  ticketId: string | null;
  ticketFormat: string | null;
  ticketStatus?: string | null;
  updatedAt: string | null;
};

export type ParticipantHistoryPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ParticipantHistoryResult = {
  items: RegistrationItem[];
  pagination: ParticipantHistoryPagination;
};

export type ParticipantHistoryQuery = {
  status?: RegistrationStatusFilter;
  page?: number;
  pageSize?: number;
};

export type EventRegistrationPayload = {
  eventId: string;
};

export type OrganizerRegistrationItem = {
  id: string;
  participantName: string;
  status: RegistrationStatus;
  ticketRef: string | null;
};

export type OrganizerEventRegistrationsView = {
  eventId: string;
  eventTitle: string;
  registrations: OrganizerRegistrationItem[];
};
