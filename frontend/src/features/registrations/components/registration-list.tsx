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

function resolveStatusState(registration: RegistrationItem) {
  if (registration.status === "CONFIRMED") {
    return {
      title: "Registration confirmed",
      description: registration.canDownloadTicket
        ? "Your place is secured and the ticket record is already available."
        : "Your place is secured. Ticket details will appear here as soon as they are ready.",
      tone: "text-emerald-700"
    };
  }

  if (registration.status === "WAITLISTED") {
    return {
      title: "Currently waitlisted",
      description: registration.waitlistPosition
        ? `You are currently number ${registration.waitlistPosition} on the waitlist for this event.`
        : "You are still on the waitlist for this event and should check back for movement.",
      tone: "text-amber-700"
    };
  }

  if (registration.status === "REJECTED") {
    return {
      title: "Registration not accepted",
      description: "This request did not move forward, so participation and ticket access are unavailable.",
      tone: "text-rose-700"
    };
  }

  return {
    title: "Registration cancelled",
    description: "This registration is no longer active. You can still review the event details or browse something else.",
    tone: "text-slate-700"
  };
}

function resolveTicketState(registration: RegistrationItem) {
  if (registration.canDownloadTicket && registration.ticketId) {
    return {
      title: `${registration.ticketFormat || "Ticket"} available`,
      description: "Your ticket record is ready. Download will appear here once it becomes available in the app.",
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
    description: "Your registration is active, but ticket details are not ready to use in the app yet.",
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
      {mutation.isSuccess ? (
        <p
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          Your registration was cancelled. The list will refresh automatically.
        </p>
      ) : null}
      {mutation.error ? (
        <p
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {mutation.error.message}
        </p>
      ) : null}
      {registrations.map((registration) => {
        const statusState = resolveStatusState(registration);
        const ticketState = resolveTicketState(registration);
        const isCancellingThis =
          mutation.isPending && mutation.variables === registration.id;

        return (
          <Card
            key={registration.id}
            className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]"
          >
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-ink">{registration.eventTitle}</h3>
                <StatusBadge status={registration.status} />
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                <p>{formatDate(registration.eventDate)}</p>
                {registration.eventCity ? <p>{registration.eventCity}</p> : null}
                {registration.updatedAt ? (
                  <p>Updated {formatDate(registration.updatedAt)}</p>
                ) : null}
              </div>

              <div className="grid gap-2 rounded-3xl border border-slate-100 bg-white/70 p-4">
                <p className="text-sm font-semibold text-ink">Registration status</p>
                <p className={`text-sm font-medium ${statusState.tone}`}>{statusState.title}</p>
                <p className="text-sm text-slate-600">{statusState.description}</p>
                {registration.waitlistPosition ? (
                  <p className="text-xs text-amber-700">
                    Current waitlist position: {registration.waitlistPosition}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2 rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold text-ink">Ticket readiness</p>
              <p className={`text-sm font-medium ${ticketState.tone}`}>{ticketState.title}</p>
              <p className="text-sm text-slate-600">{ticketState.description}</p>
              {registration.ticketId ? (
                <p className="text-xs text-slate-500">
                  Ticket reference:{" "}
                  <span className="font-medium text-slate-700">{registration.ticketId}</span>
                  {registration.ticketFormat ? ` | Format: ${registration.ticketFormat}` : ""}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link href={`/events/${registration.eventId}`} className="w-full sm:w-auto">
                <Button variant="ghost" className="w-full sm:w-auto">Open event</Button>
              </Link>
              <Button
                variant="danger"
                onClick={() => mutation.mutate(registration.id)}
                disabled={
                  registration.status === "CANCELLED" ||
                  registration.status === "REJECTED" ||
                  isCancellingThis
                }
                className="w-full sm:w-auto"
              >
                {isCancellingThis ? "Cancelling..." : "Cancel"}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
