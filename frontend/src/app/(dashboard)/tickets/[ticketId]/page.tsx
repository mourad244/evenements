"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { RoleGuard } from "@/components/guards/role-guard";
import { PageTitle } from "@/components/shared/page-title";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { UnavailableState } from "@/components/ui/unavailable-state";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useTicketQuery } from "@/features/tickets/hooks/use-ticket-query";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format-date";

function formatPayload(payload: Record<string, unknown> | string | null) {
  if (!payload) return "No ticket payload is available yet.";
  if (typeof payload === "string") return payload;
  return JSON.stringify(payload, null, 2);
}

export default function TicketDetailsPage() {
  const { data: user } = useCurrentUser();
  const params = useParams();
  const ticketId = typeof params?.ticketId === "string" ? params.ticketId : "";
  const ticketQuery = useTicketQuery(ticketId || undefined);

  if (!ticketId) {
    return (
      <UnavailableState
        title="Ticket not found"
        description="This ticket link is missing or invalid."
        action={
          <Link href={ROUTES.myRegistrations}>
            <Button>Back to registrations</Button>
          </Link>
        }
      />
    );
  }

  return (
    <RoleGuard user={user} allowedRoles={["PARTICIPANT"]}>
      <div className="grid gap-10">
        <PageTitle
          eyebrow="Ticket"
          title="Your ticket"
          description="Review your issued ticket details and the payload provided by the backend."
        />

        {ticketQuery.isLoading ? (
          <LoadingState label="Loading ticket details..." variant="detail" />
        ) : ticketQuery.isError ? (
          ticketQuery.error?.status === 410 || ticketQuery.error?.status === 404 ? (
            <UnavailableState
              title="Ticket unavailable"
              description={
                ticketQuery.error.status === 410
                  ? "This ticket is not active yet. Return to your registrations to track readiness."
                  : "This ticket cannot be found. Return to your registrations to verify the ticket reference."
              }
              action={
                <Link href={ROUTES.myRegistrations}>
                  <Button>Back to registrations</Button>
                </Link>
              }
            />
          ) : (
            <ErrorState
              title="Could not load ticket"
              description={
                ticketQuery.error?.message || "The ticket service did not respond in time."
              }
              action={
                <Link href={ROUTES.myRegistrations}>
                  <Button variant="ghost">Back to registrations</Button>
                </Link>
              }
            />
          )
        ) : ticketQuery.data ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <Card className="grid gap-5 border-[rgba(88,116,255,0.2)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.14),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_28px_64px_rgba(14,24,54,0.3)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="grid gap-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
                    Ticket details
                  </p>
                  <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                    Ticket {ticketQuery.data.ticketRef || ticketQuery.data.ticketId}
                  </h2>
                </div>
                <StatusBadge status={ticketQuery.data.status} />
              </div>

              <div className="grid gap-3 rounded-[22px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.72)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                <p>
                  Ticket ID{" "}
                  <span className="font-medium text-[var(--text-primary)]">
                    {ticketQuery.data.ticketId}
                  </span>
                </p>
                <p>
                  Registration{" "}
                  <span className="font-medium text-[var(--text-primary)]">
                    {ticketQuery.data.registrationId}
                  </span>
                </p>
                <p>
                  Event{" "}
                  <span className="font-medium text-[var(--text-primary)]">
                    {ticketQuery.data.eventId}
                  </span>
                </p>
                <p>
                  Format{" "}
                  <span className="font-medium text-[var(--text-primary)]">
                    {ticketQuery.data.ticketFormat || "Ticket"}
                  </span>
                </p>
                <p>
                  Issued{" "}
                  <span className="font-medium text-[var(--text-primary)]">
                    {ticketQuery.data.issuedAt ? formatDate(ticketQuery.data.issuedAt) : "Pending"}
                  </span>
                </p>
                {ticketQuery.data.updatedAt ? (
                  <p>
                    Updated{" "}
                    <span className="font-medium text-[var(--text-primary)]">
                      {formatDate(ticketQuery.data.updatedAt)}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={ROUTES.myRegistrations} className="w-full sm:w-auto">
                  <Button variant="ghost" className="w-full sm:w-auto">
                    Back to registrations
                  </Button>
                </Link>
                <Link href={ROUTES.events} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">Browse events</Button>
                </Link>
              </div>
            </Card>

            <Card className="grid gap-4 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(15,24,40,0.94),rgba(8,14,24,0.98))] shadow-[0_24px_56px_rgba(0,0,0,0.28)]">
              <div className="grid gap-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
                  Ticket payload
                </p>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Backend record
                </h3>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  This payload reflects the issued ticket data exposed by the backend.
                </p>
              </div>
              <pre className="max-h-[360px] overflow-auto rounded-[22px] border border-[var(--line-soft)] bg-[rgba(8,13,24,0.62)] p-4 text-xs text-[var(--text-secondary)]">
                {formatPayload(ticketQuery.data.payload)}
              </pre>
            </Card>
          </div>
        ) : null}
      </div>
    </RoleGuard>
  );
}
