"use client";

import Link from "next/link";

import { PageTitle } from "@/components/shared/page-title";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useOrganizerEventsQuery } from "@/features/events/hooks/use-organizer-events-query";
import type { EventItem } from "@/features/events/types/event.types";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format-date";

function sortEventsByDate(events: EventItem[]) {
  return [...events].sort((left, right) => Date.parse(left.startAt) - Date.parse(right.startAt));
}

function OrganizerEventSection({
  title,
  description,
  events,
  emptyTitle,
  emptyDescription
}: {
  title: string;
  description: string;
  events: EventItem[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <Card className="grid gap-4.5">
      <div className="grid gap-1">
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
        <p className="text-sm text-slate-600">{description}</p>
      </div>

      {events.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} align="left" />
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50/70 p-4 xl:flex-row xl:items-center xl:justify-between"
            >
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-ink">{event.title}</h3>
                  <StatusBadge status={event.status} />
                </div>
                <p className="text-sm text-slate-600">{event.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                  <p>{formatDate(event.startAt)}</p>
                  <p>
                    {event.city} | {event.venue}
                  </p>
                  <p>{event.capacity} seats</p>
                </div>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap xl:justify-end">
                <Link href={`/organizer/events/${event.id}`} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">
                    {event.status === "DRAFT" ? "Continue draft" : "Open event"}
                  </Button>
                </Link>
                <Link
                  href={`/organizer/events/${event.id}/registrations`}
                  className="w-full sm:w-auto"
                >
                  <Button variant="ghost" className="w-full sm:w-auto">
                    Registrations
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function OrganizerEventsPage() {
  const { data = [], isLoading, isError, error } = useOrganizerEventsQuery();
  const sortedEvents = sortEventsByDate(data);
  const draftEvents = sortedEvents.filter((event) => event.status === "DRAFT");
  const publishedEvents = sortedEvents.filter((event) => event.status === "PUBLISHED");
  const otherEvents = sortedEvents.filter(
    (event) => event.status !== "DRAFT" && event.status !== "PUBLISHED"
  );

  return (
    <div className="grid gap-8">
      <PageTitle
        eyebrow="Organizer"
        title="Organizer events"
        description="Manage drafts, monitor published events, and move quickly between the organizer tasks that matter most."
      />
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <h2 className="text-xl font-semibold text-ink">Event workspace</h2>
          <p className="text-sm text-slate-600">
            Keep drafts and published events organized in one place, with clear next steps for each stage.
          </p>
        </div>
        <Link href={ROUTES.organizerNewEvent} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Create event</Button>
        </Link>
      </Card>

      {isLoading ? (
        <LoadingState label="Loading organizer events..." />
      ) : isError ? (
        <ErrorState title="Could not load organizer events" description={error.message} />
      ) : data.length === 0 ? (
        <EmptyState
          title="No organizer events yet"
          description="Create your first event draft to begin publishing and managing registrations."
          action={
            <Link href={ROUTES.organizerNewEvent} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Create event</Button>
            </Link>
          }
          align="left"
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="grid gap-2.5">
              <p className="text-sm text-slate-500">Draft events</p>
              <h2 className="text-2xl font-semibold text-ink">{draftEvents.length}</h2>
              <p className="text-sm text-slate-600">
                Drafts that still need refinement or publishing.
              </p>
            </Card>
            <Card className="grid gap-2.5">
              <p className="text-sm text-slate-500">Published events</p>
              <h2 className="text-2xl font-semibold text-ink">{publishedEvents.length}</h2>
              <p className="text-sm text-slate-600">
                Live events that participants can already discover.
              </p>
            </Card>
            <Card className="grid gap-2.5">
              <p className="text-sm text-slate-500">Total managed events</p>
              <h2 className="text-2xl font-semibold text-ink">{sortedEvents.length}</h2>
              <p className="text-sm text-slate-600">
                Your complete organizer event list across every visible status.
              </p>
            </Card>
          </div>

          <OrganizerEventSection
            title="Drafts to finish"
            description="These events still need organizer attention before they are ready to publish."
            events={draftEvents}
            emptyTitle="No drafts right now"
            emptyDescription="Create a new draft whenever you are ready to plan your next event."
          />

          <OrganizerEventSection
            title="Published events"
            description="These events are already live, so this is the fastest place to review details and registrations."
            events={publishedEvents}
            emptyTitle="No published events yet"
            emptyDescription="Published events will appear here once one of your drafts goes live."
          />

          {otherEvents.length > 0 ? (
            <OrganizerEventSection
              title="Other event states"
              description="Any events outside the main draft and published workflow will appear here."
              events={otherEvents}
              emptyTitle=""
              emptyDescription=""
            />
          ) : null}
        </>
      )}
    </div>
  );
}
