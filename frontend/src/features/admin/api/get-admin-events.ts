import { getTemporaryAdminEvents } from "./get-admin-events-temporary";

export async function getAdminEvents() {
  return getTemporaryAdminEvents();
}
