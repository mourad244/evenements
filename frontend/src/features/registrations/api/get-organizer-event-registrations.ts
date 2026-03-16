import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type {
  OrganizerEventRegistrationsView,
  OrganizerRegistrationItem
} from "../types/registration.types";

function mapOrganizerRegistration(
  input: Record<string, unknown>
): OrganizerRegistrationItem {
  return {
    id: String(input.registrationId || input.id || ""),
    participantName: String(
      input.participantName || input.participantEmail || "Participant"
    ),
    status: String(input.status || "CONFIRMED") as OrganizerRegistrationItem["status"],
    ticketRef: input.ticketRef ? String(input.ticketRef) : null
  };
}

export async function getOrganizerEventRegistrations(
  eventId: string
): Promise<OrganizerEventRegistrationsView> {
  try {
    const response = await apiClient.get(
      ENDPOINTS.registrations.organizerEventRegistrations(eventId)
    );
    const data = response.data?.data || response.data || {};
    const items = Array.isArray(data.items) ? data.items : [];

    return {
      eventId: String(data.event?.eventId || eventId),
      eventTitle: String(data.event?.title || "Event registrations"),
      registrations: items.map((item: Record<string, unknown>) =>
        mapOrganizerRegistration(item)
      )
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}
