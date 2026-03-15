export type RegistrationStatus = "CONFIRMED" | "WAITLISTED" | "CANCELLED";

export type RegistrationItem = {
  id: string;
  eventId: string;
  eventTitle: string;
  status: RegistrationStatus;
  ticketReady: boolean;
  eventDate: string;
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
