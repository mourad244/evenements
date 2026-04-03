"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format-date";

import { useCreatePaymentSessionMutation } from "@/features/payments/hooks/use-create-payment-session-mutation";

import { useCancelRegistrationMutation } from "../hooks/use-cancel-registration-mutation";
import type { RegistrationItem } from "../types/registration.types";

type PaymentDraft = {
  amount: string;
  currency: string;
};

const defaultPaymentDraft: PaymentDraft = {
  amount: "",
  currency: ""
};

function resolveStatusState(registration: RegistrationItem) {
  const paymentPending =
    registration.status === "CONFIRMED" &&
    Boolean(registration.ticketId) &&
    !registration.canDownloadTicket;
  if (registration.status === "CONFIRMED") {
    return {
      title: "Registration confirmed",
      description: registration.canDownloadTicket
        ? "Your place is secured and the ticket record is already available."
        : paymentPending
            ? "Your place is secured. Payment confirmation is still pending, and ticket access will unlock after it completes."
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
  if (
    registration.status === "CONFIRMED" &&
    registration.ticketId &&
    !registration.canDownloadTicket
  ) {
    return {
      title: "Payment pending",
      description: "Your ticket will unlock automatically once payment is confirmed.",
      tone: "text-[var(--status-warning)]"
    };
  }

  if (registration.canDownloadTicket && registration.ticketId) {
    return {
      title: `${registration.ticketFormat || "Ticket"} available`,
      description: "Your ticket record is ready. Download will appear here once it becomes available in the app.",
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
      title: registration.canDownloadTicket
        ? "Everything is in place"
        : registration.ticketId
            ? "Payment confirmation pending"
            : "Check back for ticket readiness",
      description: registration.canDownloadTicket
        ? "You can review the event details any time, and your full participant history will keep this record visible."
        : registration.ticketId
            ? "Payment confirmation will update your ticket automatically. Return here for the latest status."
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
  const [paymentDrafts, setPaymentDrafts] = useState<Record<string, PaymentDraft>>({});
  const sortedRegistrations = [...registrations].sort((left, right) => {
    const leftDate = left.updatedAt || left.eventDate;
    const rightDate = right.updatedAt || right.eventDate;

    return Date.parse(rightDate) - Date.parse(leftDate);
  });
  const updatePaymentDraft = (registrationId: string, next: Partial<PaymentDraft>) => {
    setPaymentDrafts((prev) => {
      const current = prev[registrationId] || defaultPaymentDraft;
      return {
        ...prev,
        [registrationId]: {
          ...current,
          ...next
        }
      };
    });
  };

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
      {sortedRegistrations.map((registration) => {
        const statusState = resolveStatusState(registration);
        const ticketState = resolveTicketState(registration);
        const nextStep = resolveNextStep(registration);
        const isCancellingThis =
          mutation.isPending && mutation.variables === registration.id;
        const paymentPending =
          registration.status === "CONFIRMED" &&
          Boolean(registration.ticketId) &&
          !registration.canDownloadTicket;
        const paymentDraft = paymentDrafts[registration.id] || defaultPaymentDraft;
        const derivedAmount =
          paymentDraft.amount ||
          (typeof registration.eventPrice === "number"
            ? String(registration.eventPrice)
            : "");
        const derivedCurrency =
          paymentDraft.currency || registration.eventCurrency || "MAD";
        const paymentAmount = Number.parseInt(derivedAmount, 10);
        const canSubmitPayment =
          Number.isInteger(paymentAmount) && paymentAmount >= 0 && derivedCurrency;
        const isPayingThis =
          paymentMutation.isPending &&
          paymentMutation.variables?.registrationId === registration.id;
        const paymentSuccess =
          paymentMutation.isSuccess &&
          paymentMutation.data?.registrationId === registration.id;
        const paymentError =
          paymentMutation.error && paymentMutation.variables?.registrationId === registration.id
            ? paymentMutation.error
            : null;
        const showPaymentInputs =
          registration.status === "CONFIRMED" &&
          !registration.canDownloadTicket &&
          !paymentPending;

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
              <p className={`text-sm font-medium ${ticketState.tone}`}>{ticketState.title}</p>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">{ticketState.description}</p>
              {registration.ticketId ? (
                <p className="text-xs text-[var(--text-muted)]">
                  Ticket reference:{" "}
                  <span className="font-medium text-[var(--text-primary)]">{registration.ticketId}</span>
                  {registration.ticketFormat ? ` | Format: ${registration.ticketFormat}` : ""}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4">
              <div className="grid gap-2 rounded-[24px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.68)] p-4">
                <p className="text-sm font-semibold text-[var(--text-primary)]">What to do next</p>
                <p className="text-sm font-medium text-[var(--text-primary)]">{nextStep.title}</p>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">{nextStep.description}</p>
              </div>
              {showPaymentInputs ? (
                <div className="grid gap-3 rounded-[24px] border border-[rgba(88,116,255,0.24)] bg-[rgba(12,18,34,0.7)] p-4">
                  <div className="grid gap-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      Start payment session
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Enter the confirmed amount to unlock ticket access after payment completes.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
                    <Input
                      label="Amount"
                      type="number"
                      min="0"
                      step="1"
                      value={derivedAmount}
                      onChange={(event) =>
                        updatePaymentDraft(registration.id, { amount: event.target.value })
                      }
                      placeholder="0"
                    />
                    <Input
                      label="Currency"
                      value={derivedCurrency}
                      onChange={(event) =>
                        updatePaymentDraft(registration.id, {
                          currency: event.target.value.toUpperCase()
                        })
                      }
                      placeholder="MAD"
                    />
                  </div>
                  {paymentSuccess ? (
                    <p className="text-xs text-[var(--status-success)]">
                      Payment confirmed. Your ticket is now being issued — refresh to see it.
                    </p>
                  ) : null}
                  {paymentError ? (
                    <p className="text-xs text-[var(--status-danger)]">
                      {paymentError.message}
                    </p>
                  ) : null}
                  <Button
                    onClick={() =>
                      paymentMutation.mutate({
                        amount: paymentAmount,
                        currency: derivedCurrency.trim() || "MAD",
                        registrationId: registration.id,
                        eventId: registration.eventId,
                        metadata: {
                          source: "participant-history"
                        }
                      })
                    }
                    disabled={!canSubmitPayment || isPayingThis}
                    className="w-full"
                  >
                    {isPayingThis ? "Starting payment..." : "Start payment"}
                  </Button>
                </div>
              ) : null}
              <div className="flex flex-col gap-3 sm:flex-row xl:flex-col xl:items-stretch xl:justify-start">
                <Link href={`${ROUTES.events}/${registration.eventId}`} className="w-full sm:w-auto">
                  <Button variant="ghost" className="w-full sm:w-auto">Review event</Button>
                </Link>
                {registration.canDownloadTicket && registration.ticketId ? (
                  <Link href={`/tickets/${registration.ticketId}`} className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto">View ticket</Button>
                  </Link>
                ) : null}
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
