"use client";

import Link from "next/link";
import { useState } from "react";

import { PageTitle } from "@/components/shared/page-title";
import { SectionPanel } from "@/components/shared/section-panel";
import { StatusBadge } from "@/components/shared/status-badge";
import { SummaryCard } from "@/components/shared/summary-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useOrganizerEventsQuery } from "@/features/events/hooks/use-organizer-events-query";
import type { EventItem } from "@/features/events/types/event.types";
import { useMyRegistrationsQuery } from "@/features/registrations/hooks/use-my-registrations-query";
import {
  type RegistrationItem,
  type RegistrationStatus
} from "@/features/registrations/types/registration.types";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format-date";

function getParticipantAction(registrations: RegistrationItem[]) {
  const activeRegistration = registrations.find(
    (registration) =>
      registration.status !== "CANCELLED" && registration.status !== "REJECTED"
  );

  if (!activeRegistration) {
    return {
      title: "Find your next event",
      description:
        "You do not have an active participation yet, so the best next step is to browse upcoming events.",
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
    WAITLISTED: activeRegistration.waitlistPosition
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
      activeRegistration.status === "CONFIRMED" ? "Review event" : "Open history"
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

function getParticipantActivityNote(registration: RegistrationItem) {
  if (registration.status === "CONFIRMED") {
    return registration.canDownloadTicket
      ? "Confirmed place with ticket details already visible in your history."
      : "Confirmed place. Ticket readiness will appear in your history as soon as it is available.";
  }

  if (registration.status === "WAITLISTED") {
    return registration.waitlistPosition
      ? `Still waitlisted at position ${registration.waitlistPosition}.`
      : "Still waitlisted and waiting for movement.";
  }

  if (registration.status === "REJECTED") {
    return "This request did not move forward.";
  }

  return "This registration is no longer active.";
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
    return <LoadingState label="Loading your dashboard..." variant="dashboard" />;
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
  const waitlistedRegistrations = registrations.filter(
    (registration) => registration.status === "WAITLISTED"
  );
  const ticketReadyRegistrations = registrations.filter(
    (registration) => registration.canDownloadTicket && registration.ticketId
  );

  return (
    <div className="grid gap-8">
      <SectionPanel
        eyebrow="Participant focus"
        title="What needs your attention now"
        description="Stay on top of your next event, your active registrations, and the fastest path back into your participant history."
        className="grid gap-6 border-[rgba(88,116,255,0.2)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.18),transparent_32%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(10,17,30,0.98))] shadow-[0_30px_70px_rgba(18,29,68,0.28)]"
        action={
          <>
            <Link href={ROUTES.myRegistrations} className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full sm:w-auto">
                Open my registrations
              </Button>
            </Link>
            <Link href={ROUTES.events} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Browse events</Button>
            </Link>
          </>
        }
      >
        <div className="grid gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1.3fr)_repeat(2,minmax(0,1fr))]">
          <Card className="relative grid gap-5 overflow-hidden border-[rgba(88,116,255,0.24)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.22),transparent_30%),linear-gradient(180deg,rgba(22,34,58,0.98),rgba(10,17,30,0.98))] shadow-[0_26px_58px_rgba(24,40,98,0.3)]">
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]" />
            <div className="grid gap-1.5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
                What to focus on now
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                {nextAction.title}
              </h2>
              <p className="max-w-[42ch] text-sm leading-6 text-[var(--text-secondary)]">
                {nextAction.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[var(--line-soft)] bg-[rgba(12,20,35,0.72)] px-3 py-1.5 text-sm text-[var(--text-secondary)]">
                Active registrations:{" "}
                <span className="font-semibold text-[var(--text-primary)]">{activeRegistrations.length}</span>
              </span>
              <span className="rounded-full border border-[rgba(88,116,255,0.2)] bg-[rgba(88,116,255,0.12)] px-3 py-1.5 text-sm text-[var(--text-primary)]">
                Ticket-ready: {ticketReadyRegistrations.length}
              </span>
              <span className="rounded-full border border-[rgba(243,154,99,0.18)] bg-[rgba(243,154,99,0.1)] px-3 py-1.5 text-sm text-[var(--text-primary)]">
                Waitlisted: {waitlistedRegistrations.length}
              </span>
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
            accent="highlight"
          />
          <SummaryCard
            label="Ticket-ready now"
            value={String(ticketReadyRegistrations.length)}
            description="Registrations in your history that already expose ticket details."
          />
        </div>
      </SectionPanel>

      <SectionPanel
        eyebrow="Participant activity"
        title="Recent activity"
        description="Review the latest changes in your registration history and jump back into the event or your full participant view."
        className="grid gap-6 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(15,24,40,0.94),rgba(8,14,24,0.98))]"
        action={
          <Link href={ROUTES.myRegistrations} className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto">
              Open my registrations
            </Button>
          </Link>
        }
      >
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
                className="flex flex-col gap-3 rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.78),rgba(10,17,30,0.9))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="grid gap-1">
                  <h3 className="font-semibold text-[var(--text-primary)]">{registration.eventTitle}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {formatDate(registration.eventDate)}
                    {registration.eventCity ? ` | ${registration.eventCity}` : ""}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {getParticipantActivityNote(registration)}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
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
      </SectionPanel>
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
    return <LoadingState label="Loading organizer summary..." variant="dashboard" />;
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
    <div className="grid gap-8">
      <SectionPanel
        eyebrow="Organizer overview"
        title="What needs attention in your event workspace"
        description="Track draft progress, keep live events in view, and move quickly into registrations or event editing."
        className="grid gap-6 border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.16),transparent_32%),linear-gradient(180deg,rgba(17,27,46,0.96),rgba(9,15,26,0.98))] shadow-[0_30px_70px_rgba(18,29,68,0.24)]"
        action={
          <>
            <Link href={ROUTES.organizerEvents} className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full sm:w-auto">
                Open workspace
              </Button>
            </Link>
            <Link href={ROUTES.organizerNewEvent} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Create event</Button>
            </Link>
          </>
        }
      >
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            label="Draft events"
            value={String(drafts.length)}
            description="Drafts that still need review, completion, or publishing."
            accent="highlight"
          />
          <SummaryCard
            label="Published events"
            value={String(published.length)}
            description="Events currently exposed to the public catalog."
          />
          <Card className="relative grid gap-4 overflow-hidden border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.16),transparent_30%),linear-gradient(180deg,rgba(20,31,50,0.98),rgba(10,17,30,0.98))] shadow-[0_24px_56px_rgba(51,28,8,0.22)]">
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-warm)]">
              Registration shortcut
            </p>
            {shortcutEvent ? (
              <>
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {shortcutEvent.title}
                </h2>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Jump into registrations for a live or upcoming managed event.
                </p>
                <Link
                  href={`/organizer/events/${shortcutEvent.id}/registrations`}
                  className="w-full sm:w-auto"
                >
                  <Button className="w-full sm:w-auto">View registrations</Button>
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                  Create your first event
                </h2>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Start with a draft to unlock publishing and registration workflows.
                </p>
                <Link href={ROUTES.organizerNewEvent} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">Create event</Button>
                </Link>
              </>
            )}
          </Card>
        </div>
      </SectionPanel>

      <SectionPanel
        eyebrow="Organizer activity"
        title="Managed events"
        description="Review your latest drafts and published events, then jump directly into editing or registration monitoring."
        className="grid gap-6 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(15,24,40,0.94),rgba(8,14,24,0.98))]"
        action={
          <Link href={ROUTES.organizerEvents} className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto">
              Open workspace
            </Button>
          </Link>
        }
      >
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
                className="flex flex-col gap-3 rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.78),rgba(10,17,30,0.9))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)] lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="grid gap-1">
                  <h3 className="font-semibold text-[var(--text-primary)]">{event.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
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
      </SectionPanel>
    </div>
  );
}

function AdminDashboard() {
  return (
    <SectionPanel
      eyebrow="Admin overview"
      title="Platform operations at a glance"
      description="Review and moderate events, manage users, and keep the platform running smoothly from your admin workspace."
      className="grid gap-6 border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.14),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(10,17,30,0.98))] shadow-[0_28px_64px_rgba(0,0,0,0.32)]"
      action={
        <>
          <Link href={ROUTES.adminEvents} className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto">
              Manage events
            </Button>
          </Link>
          <Link href={ROUTES.adminUsers} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Manage users</Button>
          </Link>
        </>
      }
    >
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        <SummaryCard
          label="Event moderation"
          value="All events"
          description="Review published and pending events across the platform. Approve, reject, or take action as needed."
          accent="highlight"
        />
        <Card className="grid gap-3.5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.9),rgba(10,17,30,0.98))] shadow-[0_22px_48px_rgba(0,0,0,0.24)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            User management
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            All platform users
          </h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Browse participants, organizers, and admins. View account details and manage access rights.
          </p>
          <Link href={ROUTES.adminUsers} className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto">
              View all users
            </Button>
          </Link>
        </Card>
        <Card className="grid gap-3.5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.9),rgba(10,17,30,0.98))] shadow-[0_22px_48px_rgba(0,0,0,0.24)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
            Platform health
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
            Monitor &amp; respond
          </h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Stay on top of registration activity, flag suspicious accounts, and ensure the catalog stays accurate and up to date.
          </p>
        </Card>
      </div>
    </SectionPanel>
  );
}

export default function DashboardPage() {
  const { data: user, isLoading: isUserLoading, isFetching: isUserFetching } = useCurrentUser();
  const isParticipant = user?.role === "PARTICIPANT";
  const isOrganizer = user?.role === "ORGANIZER";
  const isAdmin = user?.role === "ADMIN";

  const registrationsQuery = useMyRegistrationsQuery({}, isParticipant);
  const organizerEventsQuery = useOrganizerEventsQuery(isOrganizer);

  // Show loading while user is being fetched (covers hard-refresh and initial login)
  if (isUserLoading || (isUserFetching && !user)) {
    return <LoadingState label="Loading dashboard..." variant="dashboard" />;
  }

  // Safety: if user never loaded (no token / auth failure), nothing to render
  if (!user) {
    return <LoadingState label="Loading dashboard..." variant="dashboard" />;
  }

  const title = user ? `Welcome back, ${user.fullName}.` : "Welcome back.";

  return (
    <div className="grid gap-10">
      <PageTitle
        eyebrow="Dashboard"
        title={title}
        description="Here is a summary of your recent activity, upcoming events, and the actions that need your attention today."
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
