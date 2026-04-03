"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { PageTitle } from "@/components/shared/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { UnavailableState } from "@/components/ui/unavailable-state";
import { useTicketQuery } from "@/features/tickets/hooks/use-ticket-query";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format-date";

function resolveTicketStatus(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === "ISSUED") {
    return {
      label: "Ticket issued",
      tone: "text-[var(--status-success)]",
      description: "Your ticket is active and ready for use."
    };
  }
  if (normalized === "CANCELLED") {
    return {
      label: "Ticket cancelled",
      tone: "text-[var(--status-danger)]",
      description: "This ticket is no longer active."
    };
  }
  return {
    label: "Ticket pending",
    tone: "text-[var(--status-warning)]",
    description: "This ticket has not been activated yet."
  };
}

export default function TicketPage() {
  const params = useParams<{ ticketId: string }>();
  const { data, isLoading, isError, error } = useTicketQuery(params.ticketId);

  if (isLoading) {
    return <LoadingState label="Loading ticket details..." variant="detail" />;
  }

  if (isError) {
    const errorStatus =
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof (error as { status?: number }).status === "number"
        ? (error as { status?: number }).status
        : undefined;
    if (errorStatus === 404) {
      return (
        <UnavailableState
          title="Ticket not found"
          description="This ticket could not be found or is no longer available."
        />
      );
    }
    if (errorStatus === 410) {
      return (
        <UnavailableState
          title="Ticket inactive"
          description="This ticket is no longer active. If you believe this is a mistake, review your registrations."
        />
      );
    }

    return <ErrorState title="Could not load ticket" description={error.message} />;
  }

  if (!data) {
    return (
      <UnavailableState
        title="Ticket unavailable"
        description="The ticket details are not available right now."
      />
    );
  }

  const status = resolveTicketStatus(data.status);

  return (
    <div className="grid gap-10">
      <PageTitle
        eyebrow="Ticket"
        title={data.eventTitle ? `${data.eventTitle} ticket` : "Your ticket"}
        description="Review the ticket record tied to your registration and confirm the event details."
      />

      <Card className="grid gap-5 border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.14),transparent_28%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_28px_64px_rgba(14,24,54,0.3)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
              Ticket status
            </p>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">{status.label}</h2>
            <p className={`text-sm font-medium ${status.tone}`}>{status.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="border-[rgba(88,116,255,0.3)] bg-[rgba(88,116,255,0.16)] text-[var(--accent-primary-strong)]">
              {data.ticketFormat || "Ticket"}
            </Badge>
            <Badge className="border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-[var(--text-muted)]">
              Ticket ID: {data.ticketId}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-[var(--text-secondary)]">
          {data.ticketRef ? <span>Reference: {data.ticketRef}</span> : null}
          {data.issuedAt ? <span>Issued {formatDate(data.issuedAt)}</span> : null}
          {data.updatedAt ? <span>Updated {formatDate(data.updatedAt)}</span> : null}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="grid gap-3 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.94),rgba(9,15,26,0.98))]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
            Event details
          </p>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {data.eventTitle || "Event details"}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {data.eventStartAt ? formatDate(data.eventStartAt) : "Schedule pending"}
          </p>
          {data.eventCity ? (
            <p className="text-sm text-[var(--text-secondary)]">Location: {data.eventCity}</p>
          ) : null}
        </Card>

        <Card className="grid gap-3 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.94),rgba(9,15,26,0.98))]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
            Participant
          </p>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {data.participantName || "Participant"}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">Registration ID: {data.registrationId}</p>
        </Card>
      </div>

      <Card className="flex flex-col gap-3 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.94),rgba(9,15,26,0.98))] sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">What to do next</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Use your registrations view for the latest status updates or return to the event details.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={ROUTES.myRegistrations} className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto">
              Back to registrations
            </Button>
          </Link>
          {data.eventId ? (
            <Link href={`/events/${data.eventId}`} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Review event</Button>
            </Link>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
