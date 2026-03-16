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
    <Card className="grid gap-5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.94),rgba(9,15,26,0.98))] shadow-[0_24px_56px_rgba(0,0,0,0.28)]">
      <div className="grid gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary-strong)]">
          Organizer section
        </p>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
      </div>

      {events.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} align="left" />
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-4 rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.82),rgba(10,17,30,0.92))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)] xl:flex-row xl:items-center xl:justify-between"
            >
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{event.title}</h3>
                  <StatusBadge status={event.status} />
                </div>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">{event.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--text-muted)]">
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
    <div className="grid gap-10">
      <PageTitle
        eyebrow="Organizer"
        title="Organizer events"
        description="Manage drafts, monitor published events, and move quickly between the organizer tasks that matter most."
      />
      <Card className="flex flex-col gap-4 border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.12),transparent_28%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_28px_64px_rgba(14,24,54,0.3)] sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
            Organizer workspace
          </p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Event workspace</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Keep drafts and published events organized in one place, with clear next steps for each stage.
          </p>
        </div>
        <Link href={ROUTES.organizerNewEvent} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Create event</Button>
        </Link>
      </Card>

      {isLoading ? (
        <LoadingState label="Loading organizer events..." variant="workspace" />
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
            <Card className="grid gap-2.5 border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.12),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Draft events</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{draftEvents.length}</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Drafts that still need refinement or publishing.
              </p>
            </Card>
            <Card className="grid gap-2.5 border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.1),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Published events</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{publishedEvents.length}</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Live events that participants can already discover.
              </p>
            </Card>
            <Card className="grid gap-2.5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Total managed events</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{sortedEvents.length}</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
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
