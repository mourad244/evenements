import { getOrganizerEvents } from "@/features/events/api/get-organizer-events";

import type { AdminEvent } from "../types/admin.types";

export const TEMP_ADMIN_EVENTS_SOURCE_LABEL = "Temporary data source";
export const TEMP_ADMIN_EVENTS_NOTICE =
  "This page currently depends on a temporary adapter backed by the shared events workspace because a dedicated admin events backend contract is not available yet.";

export async function getTemporaryAdminEvents(): Promise<AdminEvent[]> {
  return getOrganizerEvents();
}
