"use client";

import Link from "next/link";

import { PageTitle } from "@/components/shared/page-title";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
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
    <Card className="grid gap-2">
      <p className="text-sm text-slate-500">{label}</p>
      <h2 className="text-3xl font-semibold text-ink">{value}</h2>
      <p className="text-sm text-slate-600">{description}</p>
    </Card>
  );
}

function ErrorCard({ title, message }: { title: string; message: string }) {
  return (
    <Card className="grid gap-2">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="text-sm text-slate-600">{message}</p>
    </Card>
  );
}

function EmptyCard({
  title,
  description,
  href,
  cta
}: {
  title: string;
  description: string;
  href?: string;
  cta?: string;
}) {
  return (
    <Card className="grid gap-3">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="text-sm text-slate-600">{description}</p>
      {href && cta ? (
        <Link href={href}>
          <Button variant="ghost">{cta}</Button>
        </Link>
      ) : null}
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
      title: "Discover your next event",
      description: "You do not have an active participation yet.",
      href: ROUTES.events,
      cta: "Browse events"
    };
  }

  const statusMessageMap: Record<RegistrationStatus, string> = {
    CONFIRMED: activeRegistration.canDownloadTicket
      ? "Your registration is confirmed and the ticket is ready to review."
      : "Your registration is confirmed. Keep an eye on ticket availability and event details.",
    WAITLISTED: "You are on the waitlist. Check back for status updates from the organizer.",
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
        : "Open event details"
  };
}

function sortRegistrationsByDate(registrations: RegistrationItem[]) {
  return [...registrations].sort(
    (left, right) => Date.parse(left.eventDate) - Date.parse(right.eventDate)
  );
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
  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorCard
        title="Could not load your dashboard"
        message={errorMessage || "The registrations service is not responding right now."}
      />
    );
  }

  const chronologicalRegistrations = sortRegistrationsByDate(registrations);
  const recentParticipations = [...chronologicalRegistrations].reverse().slice(0, 3);
  const upcomingRegistration = chronologicalRegistrations.find(
    (registration) =>
      registration.status !== "CANCELLED" && Date.parse(registration.eventDate) >= Date.now()
  );
  const nextAction = getParticipantAction(
    upcomingRegistration ? [upcomingRegistration, ...chronologicalRegistrations] : chronologicalRegistrations
  );

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Upcoming participation"
          value={upcomingRegistration ? formatDate(upcomingRegistration.eventDate) : "None yet"}
          description={
            upcomingRegistration
              ? upcomingRegistration.eventTitle
              : "Your next confirmed or waitlisted event will show up here."
          }
        />
        <SummaryCard
          label="Confirmed registrations"
          value={String(
            registrations.filter((registration) => registration.status === "CONFIRMED").length
          )}
          description="Live confirmed participations pulled from the registration service."
        />
        <Card className="grid gap-3">
          <p className="text-sm text-slate-500">Next relevant action</p>
          <h2 className="text-xl font-semibold text-ink">{nextAction.title}</h2>
          <p className="text-sm text-slate-600">{nextAction.description}</p>
          <Link href={nextAction.href}>
            <Button variant="ghost">{nextAction.cta}</Button>
          </Link>
        </Card>
      </div>

      <Card className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-1">
            <h2 className="text-xl font-semibold text-ink">Recent participations</h2>
            <p className="text-sm text-slate-600">
              Your latest registration activity and the current backend status for each event.
            </p>
          </div>
          <Link href={ROUTES.myRegistrations}>
            <Button variant="ghost">View all</Button>
          </Link>
        </div>

        {recentParticipations.length === 0 ? (
          <EmptyCard
            title="No participations yet"
            description="Register for an event to build your participant history and ticket access."
            href={ROUTES.events}
            cta="Browse events"
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
                  <p className="text-sm text-slate-600">{formatDate(registration.eventDate)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={registration.status} />
                  <Link href={`/events/${registration.eventId}`}>
                    <Button variant="ghost">Open event</Button>
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
  if (isLoading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorCard
        title="Could not load organizer summary"
        message={errorMessage || "The events service is not responding right now."}
      />
    );
  }

  const drafts = events.filter((event) => event.status === "DRAFT");
  const published = events.filter((event) => event.status === "PUBLISHED");
  const nextUpcomingEvent = sortEventsByStart(events).find(
    (event) => Date.parse(event.startAt) >= Date.now()
  );
  const recentEvents = [...sortEventsByStart(events)].reverse().slice(0, 3);
  const shortcutEvent = published[0] || nextUpcomingEvent || drafts[0] || events[0] || null;

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
        <Card className="grid gap-3">
          <p className="text-sm text-slate-500">Registration shortcut</p>
          {shortcutEvent ? (
            <>
              <h2 className="text-xl font-semibold text-ink">{shortcutEvent.title}</h2>
              <p className="text-sm text-slate-600">
                Jump into registrations for a live or upcoming managed event.
              </p>
              <Link href={`/organizer/events/${shortcutEvent.id}/registrations`}>
                <Button variant="ghost">View registrations</Button>
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-ink">Create your first event</h2>
              <p className="text-sm text-slate-600">
                Start with a draft to unlock publishing and registration workflows.
              </p>
              <Link href={ROUTES.organizerNewEvent}>
                <Button variant="ghost">Create event</Button>
              </Link>
            </>
          )}
        </Card>
      </div>

      <Card className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-1">
            <h2 className="text-xl font-semibold text-ink">Managed events</h2>
            <p className="text-sm text-slate-600">
              Your latest drafts and published events with direct organizer actions.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={ROUTES.organizerEvents}>
              <Button variant="ghost">Open workspace</Button>
            </Link>
            <Link href={ROUTES.organizerNewEvent}>
              <Button>Create event</Button>
            </Link>
          </div>
        </div>

        {recentEvents.length === 0 ? (
          <EmptyCard
            title="No managed events yet"
            description="Create your first draft to start publishing and registration monitoring."
            href={ROUTES.organizerNewEvent}
            cta="Create event"
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
                  <Link href={`/organizer/events/${event.id}`}>
                    <Button variant="ghost">Edit</Button>
                  </Link>
                  <Link href={`/organizer/events/${event.id}/registrations`}>
                    <Button variant="ghost">Registrations</Button>
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
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="grid gap-2">
        <p className="text-sm text-slate-500">Admin events</p>
        <h2 className="text-xl font-semibold text-ink">Temporary overview</h2>
        <p className="text-sm text-slate-600">
          A dedicated admin metrics contract is not available yet, so this page avoids invented KPIs.
        </p>
        <Link href={ROUTES.adminEvents}>
          <Button variant="ghost">Open admin events</Button>
        </Link>
      </Card>
      <Card className="grid gap-2">
        <p className="text-sm text-slate-500">Admin users</p>
        <h2 className="text-xl font-semibold text-ink">User oversight</h2>
        <p className="text-sm text-slate-600">
          Review the live admin user list while the metrics surface is still pending.
        </p>
        <Link href={ROUTES.adminUsers}>
          <Button variant="ghost">Open admin users</Button>
        </Link>
      </Card>
      <Card className="grid gap-2">
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
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spinner />
      </div>
    );
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
