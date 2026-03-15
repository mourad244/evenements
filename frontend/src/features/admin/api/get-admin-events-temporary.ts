import { getOrganizerEvents } from "@/features/events/api/get-organizer-events";

import type { AdminEvent } from "../types/admin.types";

export const TEMP_ADMIN_EVENTS_NOTICE =
  "Temporary adapter: this page currently reuses managed organizer events until a dedicated admin events contract is available.";

export async function getTemporaryAdminEvents(): Promise<AdminEvent[]> {
  return getOrganizerEvents();
}
