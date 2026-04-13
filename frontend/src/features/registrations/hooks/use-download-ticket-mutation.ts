"use client";

import { useMutation } from "@tanstack/react-query";

import { downloadTicket } from "../api/download-ticket";

export function useDownloadTicketMutation() {
  return useMutation({
    mutationFn: downloadTicket
  });
}
