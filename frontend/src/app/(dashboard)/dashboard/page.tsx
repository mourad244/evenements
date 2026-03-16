"use client";

import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageTitle } from "@/components/shared/page-title";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import type { EventItem } from "@/features/events/types/event.types";
import { useOrganizerEventsQuery } from "@/features/events/hooks/use-organizer-events-query";
import {
  type RegistrationItem,
  type RegistrationStatus
} from "@/features/registrations/types/registration.types";
import { useMyRegistrationsQuery } from "@/features/registrations/hooks/use-my-registrations-query";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format-date";

function SummaryCard({
  label,
  value,
  description
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card className="grid gap-3">
      <p className="text-sm text-slate-500">{label}</p>
      <h2 className="text-2xl font-semibold text-ink sm:text-3xl">{value}</h2>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </Card>
  );
}

function getParticipantAction(registrations: RegistrationItem[]) {
  const activeRegistration = registrations.find(
    (registration) =>
      registration.status !== "CANCELLED" && registration.status !== "REJECTED"
  );

  if (!activeRegistration) {
    return {
      title: "Find your next event",
      description: "You do not have an active participation yet, so the best next step is to browse upcoming events.",
      href: ROUTES.events,
      cta: "Browse events",
      secondaryHref: ROUTES.myRegistrations,
      secondaryCta: "Open history"
    };
  }

  const statusMessageMap: Record<RegistrationStatus, string> = {
    CONFIRMED: activeRegistration.canDownloadTicket
      ? "Your place is confirmed and ticket details are already visible in your registrations."
      : "Your place is confirmed. Keep an eye on your registrations for ticket readiness and event details.",
    WAITLISTED:
      activeRegistration.waitlistPosition
        ? `You are currently number ${activeRegistration.waitlistPosition} on the waitlist.`
        : "You are still on the waitlist. Check the event details and your registrations for updates.",
    CANCELLED: "This registration is no longer active.",
    REJECTED: "This registration was not accepted for participation."
  };

  return {
    title: activeRegistration.eventTitle,
    description: statusMessageMap[activeRegistration.status],
    href:
      activeRegistration.status === "CONFIRMED"
        ? ROUTES.myRegistrations
        : `/events/${activeRegistration.eventId}`,
    cta:
      activeRegistration.status === "CONFIRMED"
        ? "Open my registrations"
        : "Open event details",
    secondaryHref:
      activeRegistration.status === "CONFIRMED"
        ? `/events/${activeRegistration.eventId}`
        : ROUTES.myRegistrations,
    secondaryCta:
      activeRegistration.status === "CONFIRMED"
        ? "Review event"
        : "Open history"
  };
}

function sortRegistrationsByDate(registrations: RegistrationItem[]) {
  return [...registrations].sort(
    (left, right) => Date.parse(left.eventDate) - Date.parse(right.eventDate)
  );
}

function sortRegistrationsByRecentActivity(registrations: RegistrationItem[]) {
  return [...registrations].sort((left, right) => {
    const leftDate = left.updatedAt || left.eventDate;
    const rightDate = right.updatedAt || right.eventDate;

    return Date.parse(rightDate) - Date.parse(leftDate);
  });
}

function sortEventsByStart(events: EventItem[]) {
  return [...events].sort((left, right) => Date.parse(left.startAt) - Date.parse(right.startAt));
}

function ParticipantDashboard({
  registrations,
  isLoading,
  isError,
  errorMessage
}: {
  registrations: RegistrationItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
}) {
  const [currentTime] = useState(() => Date.now());

  if (isLoading) {
    return <LoadingState label="Loading your dashboard..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load your dashboard"
        description={errorMessage || "The registrations service is not responding right now."}
      />
    );
  }

  const chronologicalRegistrations = sortRegistrationsByDate(registrations);
  const recentParticipations = sortRegistrationsByRecentActivity(registrations).slice(0, 3);
  const upcomingRegistration = chronologicalRegistrations.find(
    (registration) =>
      registration.status !== "CANCELLED" && Date.parse(registration.eventDate) >= currentTime
  );
  const nextAction = getParticipantAction(
    upcomingRegistration ? [upcomingRegistration, ...chronologicalRegistrations] : chronologicalRegistrations
  );
  const activeRegistrations = registrations.filter(
    (registration) =>
      registration.status === "CONFIRMED" || registration.status === "WAITLISTED"
  );

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,1fr))]">
        <Card className="grid gap-4">
          <div className="grid gap-1">
            <p className="text-sm text-slate-500">What to focus on now</p>
            <h2 className="text-2xl font-semibold text-ink">{nextAction.title}</h2>
            <p className="text-sm leading-6 text-slate-600">{nextAction.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={nextAction.href} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">{nextAction.cta}</Button>
            </Link>
            <Link href={nextAction.secondaryHref} className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full sm:w-auto">
                {nextAction.secondaryCta}
              </Button>
            </Link>
          </div>
        </Card>
        <SummaryCard
          label="Upcoming participation"
          value={upcomingRegistration ? formatDate(upcomingRegistration.eventDate) : "None yet"}
          description={
            upcomingRegistration
              ? `${upcomingRegistration.eventTitle}${upcomingRegistration.eventCity ? ` in ${upcomingRegistration.eventCity}` : ""}`
              : "Your next confirmed or waitlisted event will show up here once you have one."
          }
        />
        <SummaryCard
          label="Active registrations"
          value={String(activeRegistrations.length)}
          description="Confirmed and waitlisted registrations that still need your attention."
        />
      </div>

      <Card className="grid gap-4.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-1">
            <h2 className="text-xl font-semibold text-ink">Recent activity</h2>
            <p className="text-sm text-slate-600">
              Your latest registration changes and the current status for each event.
            </p>
          </div>
          <Link href={ROUTES.myRegistrations} className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto">
              Open my registrations
            </Button>
          </Link>
        </div>

        {recentParticipations.length === 0 ? (
          <EmptyState
            title="No activity yet"
            description="Register for an event to start building your participation history and track future ticket readiness."
            action={
              <Link href={ROUTES.events}>
                <Button>Browse events</Button>
              </Link>
            }
            align="left"
          />
        ) : (
          <div className="grid gap-4">
            {recentParticipations.map((registration) => (
              <div
                key={registration.id}
                className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="grid gap-1">
                  <h3 className="font-semibold text-ink">{registration.eventTitle}</h3>
                  <p className="text-sm text-slate-600">
                    {formatDate(registration.eventDate)}
                    {registration.eventCity ? ` | ${registration.eventCity}` : ""}
                  </p>
                  <p className="text-sm text-slate-500">
                    {registration.updatedAt
                      ? `Updated ${formatDate(registration.updatedAt)}`
                      : "Waiting for the next update"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={registration.status} />
                  <Link href={ROUTES.myRegistrations} className="w-full sm:w-auto">
                    <Button variant="ghost" className="w-full sm:w-auto">
                      Open history
                    </Button>
                  </Link>
                  <Link href={`/events/${registration.eventId}`} className="w-full sm:w-auto">
                    <Button variant="ghost" className="w-full sm:w-auto">
                      Open event
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function OrganizerDashboard({
  events,
  isLoading,
  isError,
  errorMessage
}: {
  events: EventItem[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
}) {
  const [currentTime] = useState(() => Date.now());

  if (isLoading) {
    return <LoadingState label="Loading organizer summary..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load organizer summary"
        description={errorMessage || "The events service is not responding right now."}
      />
    );
  }

  const drafts = events.filter((event) => event.status === "DRAFT");
  const published = events.filter((event) => event.status === "PUBLISHED");
  const nextUpcomingEvent = sortEventsByStart(events).find(
    (event) => Date.parse(event.startAt) >= currentTime
  );
  const recentEvents = [...sortEventsByStart(events)].reverse().slice(0, 3);
  const shortcutEvent = published[0] || nextUpcomingEvent || drafts[0] || events[0] || null;

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Draft events"
          value={String(drafts.length)}
          description="Drafts that still need review, completion, or publishing."
        />
        <SummaryCard
          label="Published events"
          value={String(published.length)}
          description="Events currently exposed to the public catalog."
        />
        <Card className="grid gap-3.5">
          <p className="text-sm text-slate-500">Registration shortcut</p>
          {shortcutEvent ? (
            <>
              <h2 className="text-xl font-semibold text-ink">{shortcutEvent.title}</h2>
              <p className="text-sm text-slate-600">
                Jump into registrations for a live or upcoming managed event.
              </p>
              <Link
                href={`/organizer/events/${shortcutEvent.id}/registrations`}
                className="w-full sm:w-auto"
              >
                <Button variant="ghost" className="w-full sm:w-auto">
                  View registrations
                </Button>
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-ink">Create your first event</h2>
              <p className="text-sm text-slate-600">
                Start with a draft to unlock publishing and registration workflows.
              </p>
              <Link href={ROUTES.organizerNewEvent} className="w-full sm:w-auto">
                <Button variant="ghost" className="w-full sm:w-auto">
                  Create event
                </Button>
              </Link>
            </>
          )}
        </Card>
      </div>

      <Card className="grid gap-4.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-1">
            <h2 className="text-xl font-semibold text-ink">Managed events</h2>
            <p className="text-sm text-slate-600">
              Your latest drafts and published events with direct organizer actions.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={ROUTES.organizerNewEvent} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Create event</Button>
            </Link>
            <Link href={ROUTES.organizerEvents} className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full sm:w-auto">
                Open workspace
              </Button>
            </Link>
          </div>
        </div>

        {recentEvents.length === 0 ? (
          <EmptyState
            title="No managed events yet"
            description="Create your first draft to start publishing and registration monitoring."
            action={
                <Link href={ROUTES.organizerNewEvent} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">Create event</Button>
                </Link>
            }
            align="left"
          />
        ) : (
          <div className="grid gap-4">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex flex-col gap-3 rounded-3xl border border-slate-100 bg-slate-50/70 p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="grid gap-1">
                  <h3 className="font-semibold text-ink">{event.title}</h3>
                  <p className="text-sm text-slate-600">
                    {event.city} | {formatDate(event.startAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={event.status} />
                  <Link href={`/organizer/events/${event.id}`} className="w-full sm:w-auto">
                    <Button variant="ghost" className="w-full sm:w-auto">
                      Edit
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
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
      <Card className="grid gap-2.5">
        <p className="text-sm text-slate-500">Admin events</p>
        <h2 className="text-xl font-semibold text-ink">Temporary overview</h2>
        <p className="text-sm text-slate-600">
          A dedicated admin metrics contract is not available yet, so this page avoids invented KPIs.
        </p>
        <Link href={ROUTES.adminEvents} className="w-full sm:w-auto">
          <Button variant="ghost" className="w-full sm:w-auto">
            Open admin events
          </Button>
        </Link>
      </Card>
      <Card className="grid gap-2.5">
        <p className="text-sm text-slate-500">Admin users</p>
        <h2 className="text-xl font-semibold text-ink">User oversight</h2>
        <p className="text-sm text-slate-600">
          Review the live admin user list while the metrics surface is still pending.
        </p>
        <Link href={ROUTES.adminUsers} className="w-full sm:w-auto">
          <Button variant="ghost" className="w-full sm:w-auto">
            Open admin users
          </Button>
        </Link>
      </Card>
      <Card className="grid gap-2.5">
        <p className="text-sm text-slate-500">Metrics readiness</p>
        <h2 className="text-xl font-semibold text-ink">Awaiting backend support</h2>
        <p className="text-sm text-slate-600">
          Once the backend exposes admin KPI endpoints, this area can become a live operational summary.
        </p>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const isParticipant = user?.role === "PARTICIPANT";
  const isOrganizer = user?.role === "ORGANIZER";
  const isAdmin = user?.role === "ADMIN";

  const registrationsQuery = useMyRegistrationsQuery({}, isParticipant);
  const organizerEventsQuery = useOrganizerEventsQuery(isOrganizer);

  if (isUserLoading) {
    return <LoadingState label="Loading dashboard..." />;
  }

  const title = user ? `Welcome back, ${user.fullName}.` : "Welcome back.";

  return (
    <div className="grid gap-8">
      <PageTitle
        eyebrow="Dashboard"
        title={title}
        description="A role-aware summary of your recent activity, upcoming work, and the actions that matter most right now."
      />

      {isParticipant ? (
        <ParticipantDashboard
          registrations={registrationsQuery.data?.items || []}
          isLoading={registrationsQuery.isLoading}
          isError={registrationsQuery.isError}
          errorMessage={registrationsQuery.error?.message}
        />
      ) : null}

      {isOrganizer ? (
        <OrganizerDashboard
          events={organizerEventsQuery.data || []}
          isLoading={organizerEventsQuery.isLoading}
          isError={organizerEventsQuery.isError}
          errorMessage={organizerEventsQuery.error?.message}
        />
      ) : null}

      {isAdmin ? <AdminDashboard /> : null}
    </div>
  );
}
