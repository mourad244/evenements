"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";

async function cancelEvent(eventId: string): Promise<void> {
  try {
    await apiClient.post(`/api/events/${eventId}/cancel`);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export function useCancelEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
    }
  });
}
