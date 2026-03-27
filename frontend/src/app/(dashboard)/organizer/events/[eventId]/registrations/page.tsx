"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { PageTitle } from "@/components/shared/page-title";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { UnavailableState } from "@/components/ui/unavailable-state";
import { OrganizerRegistrationsList } from "@/features/registrations/components/organizer-registrations-list";
import { exportOrganizerEventRegistrations } from "@/features/registrations/api/export-organizer-event-registrations";
import { useOrganizerEventRegistrationsQuery } from "@/features/registrations/hooks/use-organizer-event-registrations-query";
import { ROUTES } from "@/lib/constants/routes";

export default function OrganizerEventRegistrationsPage() {
  const params = useParams<{ eventId: string }>();
  const { data, isLoading, isError, error } = useOrganizerEventRegistrationsQuery(
    params.eventId
  );
  const [exportState, setExportState] = useState<"idle" | "pending" | "success" | "error">(
    "idle"
  );
  const [exportError, setExportError] = useState<string | null>(null);
  const confirmedCount =
    data?.registrations.filter((registration) => registration.status === "CONFIRMED").length || 0;
  const waitlistedCount =
    data?.registrations.filter((registration) => registration.status === "WAITLISTED").length || 0;
  const pendingTicketRefs =
    data?.registrations.filter(
      (registration) => registration.status === "CONFIRMED" && !registration.ticketRef
    ).length || 0;

  async function handleExport() {
    if (!params.eventId) return;
    setExportState("pending");
    setExportError(null);

    try {
      const result = await exportOrganizerEventRegistrations(params.eventId);
      const downloadUrl = window.URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = result.filename;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setExportState("success");
    } catch (exportFailure) {
      const message =
        exportFailure && typeof exportFailure === "object" && "message" in exportFailure
          ? String((exportFailure as { message?: string }).message || "Export failed")
          : "Export failed";
      setExportError(message);
      setExportState("error");
    }
  }

  return (
    <div className="grid gap-10">
      <PageTitle
        eyebrow="Organizer"
        title="Event registrations"
        description="Review the participant list, registration states, and ticket-reference readiness for a specific managed event."
      />

      <Card className="flex flex-wrap items-center justify-between gap-3 border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.14),transparent_28%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_28px_64px_rgba(14,24,54,0.3)]">
        <div className="grid gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
            Managed event
          </p>
          <p className="text-base font-medium text-[var(--text-primary)]">
            {data?.eventTitle || "Selected event"}
          </p>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Keep track of who is confirmed, who is waiting, and which tickets are already issued.
          </p>
          {data ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="rounded-full border border-[rgba(88,116,255,0.2)] bg-[rgba(88,116,255,0.12)] px-3 py-1.5 text-sm text-[var(--text-primary)]">
                Confirmed: {confirmedCount}
              </span>
              <span className="rounded-full border border-[rgba(243,154,99,0.18)] bg-[rgba(243,154,99,0.1)] px-3 py-1.5 text-sm text-[var(--text-primary)]">
                Waitlisted: {waitlistedCount}
              </span>
              <span className="rounded-full border border-[var(--line-soft)] bg-[rgba(12,20,35,0.72)] px-3 py-1.5 text-sm text-[var(--text-secondary)]">
                Ticket refs pending: {pendingTicketRefs}
              </span>
            </div>
          ) : null}
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={!data || exportState === "pending"}
            className="w-full sm:w-auto"
          >
            {exportState === "pending" ? "Exporting..." : "Export CSV"}
          </Button>
          <Link href={`/organizer/events/${params.eventId}`} className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto">
              Back to event
            </Button>
          </Link>
          <Link href={ROUTES.organizerEvents} className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto">
              All organizer events
            </Button>
          </Link>
        </div>
      </Card>

      {exportState === "success" ? (
        <p
          role="status"
          className="rounded-[18px] border border-[rgba(88,116,255,0.28)] bg-[rgba(88,116,255,0.12)] px-4 py-3 text-sm text-[var(--text-primary)]"
        >
          CSV export started. Your download should begin shortly.
        </p>
      ) : null}

      {exportState === "error" && exportError ? (
        <p
          role="alert"
          className="rounded-[18px] border border-[rgba(251,113,133,0.24)] bg-[rgba(127,29,29,0.26)] px-4 py-3 text-sm text-[var(--status-danger)]"
        >
          {exportError}
        </p>
      ) : null}

      {data ? (
        <Card className="grid gap-2.5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.94),rgba(9,15,26,0.98))]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary-strong)]">
            Organizer workflow
          </p>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Use this page for participant review</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            This is the fastest surface for participant status and ticket-reference checks. Return to the event page when you need to edit event details or change the event state.
          </p>
        </Card>
      ) : null}

      {isLoading ? (
        <LoadingState label="Loading event registrations..." variant="table" />
      ) : isError ? (
        <ErrorState
          title="Could not load event registrations"
          description={error.message}
          action={
            <Link href={`/organizer/events/${params.eventId}`}>
              <Button variant="ghost">Return to event</Button>
            </Link>
          }
        />
      ) : data && data.registrations.length > 0 ? (
        <OrganizerRegistrationsList
          eventTitle={data.eventTitle}
          registrations={data.registrations}
        />
      ) : data ? (
        <EmptyState
          title="No registrations yet"
          description={`No participant registrations are currently available for ${data.eventTitle}. Confirmed and waitlisted participants will appear here once they exist.`}
          action={
            <Link href={`/organizer/events/${params.eventId}`}>
              <Button variant="ghost">Back to event</Button>
            </Link>
          }
          align="left"
        />
      ) : (
        <UnavailableState
          title="Event registrations unavailable"
          description="The event could not be resolved for this organizer view."
        />
      )}
    </div>
  );
}
