"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCreatePaymentSessionMutation } from "@/features/payments/hooks/use-create-payment-session-mutation";
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
      tone: "text-[var(--status-success)]"
    };
  }

  if (registration.status === "WAITLISTED") {
    return {
      title: "Currently waitlisted",
      description: registration.waitlistPosition
        ? `You are currently number ${registration.waitlistPosition} on the waitlist for this event.`
        : "You are still on the waitlist for this event and should check back for movement.",
      tone: "text-[var(--status-warning)]"
    };
  }

  if (registration.status === "REJECTED") {
    return {
      title: "Registration not accepted",
      description: "This request did not move forward, so participation and ticket access are unavailable.",
      tone: "text-[var(--status-danger)]"
    };
  }

  return {
    title: "Registration cancelled",
    description: "This registration is no longer active. You can still review the event details or browse something else.",
    tone: "text-[var(--text-primary)]"
  };
}

function resolveTicketState(registration: RegistrationItem) {
  if (registration.canDownloadTicket && registration.ticketId) {
    return {
      title: `${registration.ticketFormat || "Ticket"} available`,
      description: "Your ticket record is ready. Open the ticket view to see the issued payload.",
      tone: "text-[var(--status-success)]"
    };
  }

  if (registration.status === "WAITLISTED") {
    return {
      title: "Ticket unavailable while waitlisted",
      description: "Ticket access will only become available if your registration is confirmed.",
      tone: "text-[var(--status-warning)]"
    };
  }

  if (registration.status === "CANCELLED" || registration.status === "REJECTED") {
    return {
      title: "Ticket unavailable",
      description: "Cancelled or rejected registrations do not expose ticket access.",
      tone: "text-[var(--status-danger)]"
    };
  }

  return {
    title: "Ticket pending issuance",
    description: "Your registration is active, but ticket details are not ready to use in the app yet.",
    tone: "text-[var(--text-primary)]"
  };
}

function resolveNextStep(registration: RegistrationItem) {
  if (registration.status === "CONFIRMED") {
    return {
      title: registration.canDownloadTicket ? "Everything is in place" : "Check back for ticket readiness",
      description: registration.canDownloadTicket
        ? "Your ticket is ready. Open the ticket view or review the event details any time."
        : "Your place is secured. Keep this history view nearby so you can spot the ticket update as soon as it appears."
    };
  }

  if (registration.status === "WAITLISTED") {
    return {
      title: "Watch for movement",
      description: registration.waitlistPosition
        ? `You are still waitlisted at position ${registration.waitlistPosition}. Return here for the clearest view of any movement.`
        : "You are still waitlisted. Return here or open the event again for the latest context."
    };
  }

  if (registration.status === "REJECTED") {
    return {
      title: "Browse something else",
      description: "This request is closed, so the next useful step is to review the event or discover another one."
    };
  }

  return {
    title: "Use this as a record",
    description: "This registration is no longer active, but it remains in your history so you can keep a clear record of what changed."
  };
}

export function RegistrationList({ registrations }: { registrations: RegistrationItem[] }) {
  const mutation = useCancelRegistrationMutation();
  const paymentMutation = useCreatePaymentSessionMutation();
  const sortedRegistrations = [...registrations].sort((left, right) => {
    const leftDate = left.updatedAt || left.eventDate;
    const rightDate = right.updatedAt || right.eventDate;

    return Date.parse(rightDate) - Date.parse(leftDate);
  });

  if (registrations.length === 0) {
    return (
      <EmptyState
        title="No registrations yet"
        description="Your participant history will appear here once you register for an event, and this page will become the clearest place to track status changes and ticket readiness."
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
          className="rounded-[22px] border border-[rgba(52,211,153,0.22)] bg-[rgba(6,78,59,0.3)] px-4 py-3 text-sm text-[var(--status-success)]"
        >
          Your registration was cancelled. The list will refresh automatically.
        </p>
      ) : null}
      {mutation.error ? (
        <p
          role="alert"
          className="rounded-[22px] border border-[rgba(251,113,133,0.24)] bg-[rgba(127,29,29,0.26)] px-4 py-3 text-sm text-[var(--status-danger)]"
        >
          {mutation.error.message}
        </p>
      ) : null}
      {paymentMutation.error ? (
        <p
          role="alert"
          className="rounded-[22px] border border-[rgba(251,113,133,0.24)] bg-[rgba(127,29,29,0.26)] px-4 py-3 text-sm text-[var(--status-danger)]"
        >
          {paymentMutation.error.message}
        </p>
      ) : null}
      {sortedRegistrations.map((registration) => {
        const statusState = resolveStatusState(registration);
        const ticketState = resolveTicketState(registration);
        const nextStep = resolveNextStep(registration);
        const isCancellingThis =
          mutation.isPending && mutation.variables === registration.id;
        const isPaymentTarget =
          paymentMutation.variables?.registrationId === registration.id;
        const isPayable =
          registration.status === "CONFIRMED" && !registration.canDownloadTicket;
        const paymentSession = isPaymentTarget ? paymentMutation.data : null;
        const resolvedTicketState = paymentSession
          ? {
              title: "Ticket awaiting payment confirmation",
              description:
                "Ticket access will become available automatically once payment is confirmed.",
              tone: "text-[var(--text-secondary)]"
            }
          : ticketState;

        return (
          <Card
            key={registration.id}
            className="grid gap-5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.94),rgba(9,15,26,0.98))] shadow-[0_24px_56px_rgba(0,0,0,0.28)] lg:gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]"
          >
            <div className="grid gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="grid gap-1.5">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{registration.eventTitle}</h3>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Registration overview
                  </p>
                </div>
                <StatusBadge status={registration.status} />
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-[22px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.72)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                <p>{formatDate(registration.eventDate)}</p>
                {registration.eventCity ? <p>{registration.eventCity}</p> : null}
                {registration.updatedAt ? (
                  <p>Updated {formatDate(registration.updatedAt)}</p>
                ) : null}
              </div>

              <div className="grid gap-2 rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.84),rgba(10,17,30,0.92))] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Registration status</p>
                <p className={`text-sm font-medium ${statusState.tone}`}>{statusState.title}</p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">{statusState.description}</p>
                {registration.waitlistPosition ? (
                  <p className="text-xs text-[var(--status-warning)]">
                    Current waitlist position: {registration.waitlistPosition}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2 rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.84),rgba(10,17,30,0.92))] p-4">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Ticket readiness</p>
              <p className={`text-sm font-medium ${resolvedTicketState.tone}`}>
                {resolvedTicketState.title}
              </p>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                {resolvedTicketState.description}
              </p>
              {registration.ticketId ? (
                <p className="text-xs text-[var(--text-muted)]">
                  Ticket reference:{" "}
                  <span className="font-medium text-[var(--text-primary)]">{registration.ticketId}</span>
                  {registration.ticketFormat ? ` | Format: ${registration.ticketFormat}` : ""}
                </p>
              ) : null}
              {paymentSession ? (
                <div className="grid gap-2 rounded-[22px] border border-[rgba(88,116,255,0.24)] bg-[rgba(12,20,35,0.72)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary-strong)]">
                    Payment status
                  </p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Pending confirmation
                  </p>
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    Payment is not completed yet. Once confirmation arrives, your ticket will update automatically.
                  </p>
                </div>
              ) : null}
              {isPayable ? (
                <div className="grid gap-2 rounded-[22px] border border-[rgba(88,116,255,0.2)] bg-[rgba(12,20,35,0.72)] px-3 py-3 text-sm text-[var(--text-secondary)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary-strong)]">
                    Payment session
                  </p>
                  <p>
                    Start a payment session to move this confirmed registration toward ticket readiness.
                  </p>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      paymentMutation.mutate({
                        registrationId: registration.id,
                        eventId: registration.eventId,
                        amount: 0,
                        currency: "MAD",
                        metadata: { source: "participant-ui" }
                      })
                    }
                    disabled={paymentMutation.isPending && isPaymentTarget}
                    className="w-full sm:w-auto"
                  >
                    {paymentMutation.isPending && isPaymentTarget
                      ? "Starting session..."
                      : "Start payment session"}
                  </Button>
                  <p className="text-xs text-[var(--text-muted)]">
                    No external checkout is available yet in this MVP flow.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2 rounded-[24px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.68)] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">What to do next</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{nextStep.title}</p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">{nextStep.description}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row xl:flex-col xl:items-stretch xl:justify-start">
                {registration.canDownloadTicket && registration.ticketId ? (
                  <Link
                    href={`/tickets/${registration.ticketId}`}
                    className="w-full sm:w-auto"
                  >
                    <Button className="w-full sm:w-auto">View ticket</Button>
                  </Link>
                ) : null}
                <Link href={`/events/${registration.eventId}`} className="w-full sm:w-auto">
                  <Button variant="ghost" className="w-full sm:w-auto">Review event</Button>
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
            </div>
          </Card>
        );
      })}
    </div>
  );
}
