"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils/format-date";

import { useCancelRegistrationMutation } from "../hooks/use-cancel-registration-mutation";
import type { RegistrationItem } from "../types/registration.types";

export function RegistrationList({ registrations }: { registrations: RegistrationItem[] }) {
  const mutation = useCancelRegistrationMutation();

  if (registrations.length === 0) {
    return (
      <EmptyState
        title="No registrations yet"
        description="Your participant activity will appear here once the registration service is connected."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {registrations.map((registration) => (
        <Card key={registration.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-2">
            <h3 className="text-lg font-semibold text-ink">{registration.eventTitle}</h3>
            <p className="text-sm text-slate-600">{formatDate(registration.eventDate)}</p>
            <StatusBadge status={registration.status} />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost">{registration.ticketReady ? "View ticket" : "Ticket pending"}</Button>
            <Button
              variant="danger"
              onClick={() => mutation.mutate(registration.id)}
              disabled={registration.status === "CANCELLED" || mutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
