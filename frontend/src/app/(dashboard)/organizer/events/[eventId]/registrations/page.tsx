"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { PageTitle } from "@/components/shared/page-title";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { UnavailableState } from "@/components/ui/unavailable-state";
import { OrganizerRegistrationsList } from "@/features/registrations/components/organizer-registrations-list";
import { useOrganizerEventRegistrationsQuery } from "@/features/registrations/hooks/use-organizer-event-registrations-query";
import { ROUTES } from "@/lib/constants/routes";

export default function OrganizerEventRegistrationsPage() {
  const params = useParams<{ eventId: string }>();
  const { data, isLoading, isError, error } = useOrganizerEventRegistrationsQuery(
    params.eventId
  );

  return (
    <div className="grid gap-8">
      <PageTitle
        eyebrow="Organizer"
        title="Event registrations"
        description="Review the participant list, registration states, and ticket-reference readiness for a specific managed event."
      />

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <p className="text-sm font-medium text-ink">
            {data?.eventTitle || "Selected event"}
          </p>
          <p className="text-sm text-slate-600">
            Keep track of who is confirmed, who is waiting, and which tickets are already issued.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
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

      {isLoading ? (
        <LoadingState label="Loading event registrations..." />
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
