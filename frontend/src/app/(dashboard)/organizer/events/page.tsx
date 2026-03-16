"use client";

import Link from "next/link";

import { PageTitle } from "@/components/shared/page-title";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { EventList } from "@/features/events/components/event-list";
import { useOrganizerEventsQuery } from "@/features/events/hooks/use-organizer-events-query";
import { ROUTES } from "@/lib/constants/routes";

export default function OrganizerEventsPage() {
  const { data = [], isLoading, isError, error } = useOrganizerEventsQuery();

  return (
    <div className="grid gap-6">
      <PageTitle
        eyebrow="Organizer"
        title="Organizer events"
        description="Manage your event drafts and published events from one organizer workspace."
      />
      <Card className="flex justify-end">
        <Link href={ROUTES.organizerNewEvent}>
          <Button>Create event</Button>
        </Link>
      </Card>

      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Card className="grid gap-2">
          <h2 className="text-xl font-semibold text-ink">Could not load organizer events</h2>
          <p className="text-sm text-slate-600">{error.message}</p>
        </Card>
      ) : data.length === 0 ? (
        <EmptyState
          title="No organizer events yet"
          description="Create your first event draft to begin publishing and managing registrations."
          action={
            <Link href={ROUTES.organizerNewEvent}>
              <Button>Create event</Button>
            </Link>
          }
        />
      ) : (
        <EventList events={data} />
      )}
    </div>
  );
}
