"use client";

import { useMutation } from "@tanstack/react-query";

import { exportOrganizerEventRegistrations } from "../api/export-organizer-event-registrations";

export function useExportOrganizerEventRegistrationsMutation() {
  return useMutation({
    mutationFn: exportOrganizerEventRegistrations
  });
}
