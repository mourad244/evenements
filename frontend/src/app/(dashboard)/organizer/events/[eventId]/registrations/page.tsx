"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { PageTitle } from "@/components/shared/page-title";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { OrganizerRegistrationsList } from "@/features/registrations/components/organizer-registrations-list";
import { useOrganizerEventRegistrationsQuery } from "@/features/registrations/hooks/use-organizer-event-registrations-query";

export default function OrganizerEventRegistrationsPage() {
  const params = useParams<{ eventId: string }>();
  const { data, isLoading, isError, error } = useOrganizerEventRegistrationsQuery(
    params.eventId
  );

  return (
    <div className="grid gap-6">
      <PageTitle
        eyebrow="Organizer"
        title="Event registrations"
        description="Review participant registrations and status for a specific event."
      />

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <p className="text-sm font-medium text-ink">
            {data?.eventTitle || "Selected event"}
          </p>
          <p className="text-sm text-slate-600">
            Organizer-facing registration tracking powered by the gateway registration endpoint.
          </p>
        </div>
        <Link href={`/organizer/events/${params.eventId}`}>
          <Button variant="ghost">Back to event</Button>
        </Link>
      </Card>

      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Card className="grid gap-2">
          <h2 className="text-lg font-semibold text-ink">
            Could not load event registrations
          </h2>
          <p className="text-sm text-slate-600">{error.message}</p>
        </Card>
      ) : data ? (
        <OrganizerRegistrationsList
          eventTitle={data.eventTitle}
          registrations={data.registrations}
        />
      ) : (
        <Card className="grid gap-2">
          <h2 className="text-lg font-semibold text-ink">Event registrations unavailable</h2>
          <p className="text-sm text-slate-600">
            The event context could not be resolved for this organizer view.
          </p>
        </Card>
      )}
    </div>
  );
}
