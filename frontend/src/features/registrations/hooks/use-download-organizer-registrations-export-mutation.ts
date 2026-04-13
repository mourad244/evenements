"use client";

import { useMutation } from "@tanstack/react-query";

import { downloadOrganizerRegistrationsExport } from "../api/download-organizer-registrations-export";

export function useDownloadOrganizerRegistrationsExportMutation() {
  return useMutation({
    mutationFn: downloadOrganizerRegistrationsExport
  });
}
