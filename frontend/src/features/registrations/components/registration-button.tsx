"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { ROUTES } from "@/lib/constants/routes";
import { getToken } from "@/lib/auth/get-token";

import { useMyRegistrationsQuery } from "../hooks/use-my-registrations-query";
import { useRegisterToEventMutation } from "../hooks/use-register-to-event-mutation";

const statusLabel: Record<string, string> = {
  CONFIRMED: "Confirmed",
  WAITLISTED: "Waitlisted",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected"
};

const statusStyles: Record<string, string> = {
  CONFIRMED: "border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.1)] text-[var(--status-success)]",
  WAITLISTED: "border-[rgba(243,154,99,0.3)] bg-[rgba(243,154,99,0.1)] text-[var(--accent-warm)]",
  CANCELLED: "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] text-[var(--text-muted)]",
  REJECTED: "border-[rgba(251,113,133,0.24)] bg-[rgba(251,113,133,0.08)] text-[var(--status-danger)]"
};

export function RegistrationButton({ eventId }: { eventId: string }) {
  const isAuthenticated = Boolean(getToken());
  const { data: currentUser } = useCurrentUser();
  const isParticipant = currentUser?.role === "PARTICIPANT";

  const { data: registrationsData } = useMyRegistrationsQuery(
    { pageSize: 50 },
    isAuthenticated && isParticipant
  );

  const mutation = useRegisterToEventMutation();

  const existingRegistration = registrationsData?.items.find(
    (r) => r.eventId === eventId && r.status !== "CANCELLED" && r.status !== "REJECTED"
  );

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="grid gap-3">
        <Link href={`${ROUTES.login}?redirect=/events/${eventId}`} className="block">
          <Button className="w-full">Sign in to register</Button>
        </Link>
        <Link href={ROUTES.register} className="block">
          <Button variant="ghost" className="w-full">Create an account</Button>
        </Link>
        <p className="text-xs text-[var(--text-muted)]">
          A participant account is required to register.
        </p>
      </div>
    );
  }

  // Organizer or admin — cannot register
  if (currentUser && !isParticipant) {
    return (
      <p className="rounded-[18px] border border-[var(--line-soft)] bg-[rgba(255,255,255,0.03)] px-4 py-3 text-xs text-[var(--text-muted)]">
        Only participants can register for events.
      </p>
    );
  }

  // Already registered (and not cancelled/rejected)
  if (existingRegistration || mutation.isSuccess) {
    const reg = existingRegistration;
    const status = reg?.status || "CONFIRMED";
    return (
      <div className="grid gap-3">
        <div className="flex items-center gap-3 rounded-[18px] border border-[rgba(52,211,153,0.22)] bg-[rgba(6,78,59,0.25)] px-4 py-3">
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4 shrink-0 text-[var(--status-success)]" aria-hidden="true">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="grid gap-0.5">
            <p className="text-sm font-semibold text-[var(--status-success)]">You&apos;re registered</p>
            {reg ? (
              <p className="text-xs text-[var(--text-muted)]">
                Registration status:{" "}
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[status] || statusStyles.CONFIRMED}`}>
                  {statusLabel[status] || status}
                </span>
              </p>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">Your registration is being processed.</p>
            )}
          </div>
        </div>
        <Link href={ROUTES.myRegistrations} className="block">
          <Button variant="ghost" className="w-full">
            View my registrations
          </Button>
        </Link>
        {reg?.canDownloadTicket && reg.ticketId ? (
          <Link href={`${ROUTES.tickets}/${reg.ticketId}`} className="block">
            <Button className="w-full">Download ticket</Button>
          </Link>
        ) : null}
      </div>
    );
  }

  // Default: register
  return (
    <div className="grid gap-3">
      <Button
        className="w-full"
        onClick={async () => {
          try {
            await mutation.mutateAsync({ eventId });
          } catch {
            // error surfaced via mutation.isError
          }
        }}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Registering…" : "Register for this event"}
      </Button>
      {mutation.isError ? (
        <p className="rounded-[18px] border border-[rgba(251,113,133,0.24)] bg-[rgba(127,29,29,0.22)] px-4 py-3 text-xs text-[var(--status-danger)]">
          {mutation.error.message}
        </p>
      ) : null}
    </div>
  );
}
