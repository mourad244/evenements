"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format-date";

import { useCancelRegistrationMutation } from "../hooks/use-cancel-registration-mutation";
import type { RegistrationItem } from "../types/registration.types";

function resolveTicketState(registration: RegistrationItem) {
  if (registration.canDownloadTicket && registration.ticketId) {
    return {
      title: `${registration.ticketFormat || "Ticket"} available`,
      description:
        "Your ticket is ready in the backend. Download will appear here once the ticket endpoint is exposed.",
      tone: "text-emerald-700"
    };
  }

  if (registration.status === "WAITLISTED") {
    return {
      title: "Ticket unavailable while waitlisted",
      description: "Ticket access will only become available if your registration is confirmed.",
      tone: "text-amber-700"
    };
  }

  if (registration.status === "CANCELLED" || registration.status === "REJECTED") {
    return {
      title: "Ticket unavailable",
      description: "Cancelled or rejected registrations do not expose ticket access.",
      tone: "text-rose-700"
    };
  }

  return {
    title: "Ticket pending issuance",
    description: "Your registration is active, but the ticket is not yet exposed as downloadable.",
    tone: "text-slate-700"
  };
}

export function RegistrationList({ registrations }: { registrations: RegistrationItem[] }) {
  const mutation = useCancelRegistrationMutation();

  if (registrations.length === 0) {
    return (
      <EmptyState
        title="No registrations yet"
        description="Your participant history will appear here once you register for an event."
        action={
          <Link href={ROUTES.events}>
            <Button variant="ghost">Browse events</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-4">
      {registrations.map((registration) => {
        const ticketState = resolveTicketState(registration);

        return (
          <Card
            key={registration.id}
            className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto]"
          >
            <div className="grid gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-ink">{registration.eventTitle}</h3>
                <StatusBadge status={registration.status} />
              </div>
              <p className="text-sm text-slate-600">
                {formatDate(registration.eventDate)}
                {registration.eventCity ? ` | ${registration.eventCity}` : ""}
              </p>
              {registration.waitlistPosition ? (
                <p className="text-sm text-amber-700">
                  Waitlist position: {registration.waitlistPosition}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2 rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold text-ink">Ticket availability</p>
              <p className={`text-sm font-medium ${ticketState.tone}`}>{ticketState.title}</p>
              <p className="text-sm text-slate-600">{ticketState.description}</p>
              {registration.ticketId ? (
                <p className="text-xs text-slate-500">
                  Ticket ID: <span className="font-medium text-slate-700">{registration.ticketId}</span>
                  {registration.ticketFormat ? ` | Format: ${registration.ticketFormat}` : ""}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-start gap-3 lg:justify-end">
              <Link href={`/events/${registration.eventId}`}>
                <Button variant="ghost">Open event</Button>
              </Link>
              <Button
                variant="danger"
                onClick={() => mutation.mutate(registration.id)}
                disabled={
                  registration.status === "CANCELLED" ||
                  registration.status === "REJECTED" ||
                  mutation.isPending
                }
              >
                Cancel
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
