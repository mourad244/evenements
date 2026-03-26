import { StatusBadge } from "@/components/shared/status-badge";
import { SummaryCard } from "@/components/shared/summary-card";
import { DataTableShell } from "@/components/shared/data-table-shell";
import { EmptyState } from "@/components/ui/empty-state";

import type { OrganizerRegistrationItem } from "../types/registration.types";

type OrganizerRegistrationsListProps = {
  eventTitle: string;
  registrations: OrganizerRegistrationItem[];
};

function resolveOrganizerStatus(registration: OrganizerRegistrationItem) {
  if (registration.status === "CONFIRMED") {
    return {
      title: "Confirmed participation",
      description: registration.ticketRef
        ? "This participant currently holds a confirmed place and already has a visible ticket reference."
        : "This participant currently holds a confirmed place, but the ticket reference is still pending.",
      tone: "text-[var(--status-success)]"
    };
  }

  if (registration.status === "WAITLISTED") {
    return {
      title: "Waitlisted",
      description: "This participant is still waiting for a confirmed place to open up.",
      tone: "text-[var(--status-warning)]"
    };
  }

  if (registration.status === "REJECTED") {
    return {
      title: "Not accepted",
      description: "This registration did not move forward into participation.",
      tone: "text-[var(--status-danger)]"
    };
  }

  return {
    title: "Cancelled",
    description: "This registration is no longer active for the event.",
    tone: "text-[var(--text-secondary)]"
  };
}

function resolveTicketReadiness(registration: OrganizerRegistrationItem) {
  if (registration.ticketRef) {
    return {
      title: "Ticket reference available",
      description: "A ticket reference has already been issued for this registration.",
      tone: "text-[var(--status-success)]"
    };
  }

  if (registration.status === "WAITLISTED") {
    return {
      title: "Waiting for confirmation",
      description: "Ticket readiness will only appear after the participant moves out of the waitlist.",
      tone: "text-[var(--status-warning)]"
    };
  }

  if (registration.status === "CANCELLED" || registration.status === "REJECTED") {
    return {
      title: "No ticket reference",
      description: "Inactive registrations do not expose a ticket reference.",
      tone: "text-[var(--text-secondary)]"
    };
  }

  return {
    title: "Ticket reference pending",
    description: "This participant is confirmed, but a ticket reference is not visible yet.",
    tone: "text-[var(--text-secondary)]"
  };
}

function resolveOrganizerAttention(registration: OrganizerRegistrationItem) {
  if (registration.status === "CONFIRMED" && !registration.ticketRef) {
    return {
      title: "Needs attention",
      description: "Confirmed participant with no visible ticket reference yet.",
      rank: 0,
      tone: "text-[var(--status-warning)]"
    };
  }

  if (registration.status === "WAITLISTED") {
    return {
      title: "Monitor",
      description: "Waitlist movement is the main thing to watch here.",
      rank: 1,
      tone: "text-[var(--status-warning)]"
    };
  }

  if (registration.status === "CONFIRMED" && registration.ticketRef) {
    return {
      title: "Ready",
      description: "Confirmed participation with a visible ticket reference.",
      rank: 2,
      tone: "text-[var(--status-success)]"
    };
  }

  if (registration.status === "REJECTED") {
    return {
      title: "Closed",
      description: "This registration did not move forward.",
      rank: 3,
      tone: "text-[var(--status-danger)]"
    };
  }

  return {
    title: "Inactive",
    description: "This registration is no longer active for the event.",
    rank: 4,
    tone: "text-[var(--text-secondary)]"
  };
}

export function OrganizerRegistrationsList({
  eventTitle,
  registrations
}: OrganizerRegistrationsListProps) {
  const sortedRegistrations = [...registrations].sort((left, right) => {
    const rankDifference =
      resolveOrganizerAttention(left).rank - resolveOrganizerAttention(right).rank;

    if (rankDifference !== 0) {
      return rankDifference;
    }

    return left.participantName.localeCompare(right.participantName);
  });
  const confirmedCount = registrations.filter(
    (registration) => registration.status === "CONFIRMED"
  ).length;
  const waitlistedCount = registrations.filter(
    (registration) => registration.status === "WAITLISTED"
  ).length;
  const issuedTicketCount = registrations.filter(
    (registration) => registration.ticketRef !== null
  ).length;
  const attentionCount = registrations.filter(
    (registration) =>
      (registration.status === "CONFIRMED" && !registration.ticketRef) ||
      registration.status === "WAITLISTED"
  ).length;

  if (registrations.length === 0) {
    return (
      <EmptyState
        title="No participants yet"
        description={`Registrations for ${eventTitle} will appear here as soon as participants confirm or join the waitlist.`}
      />
    );
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Needs attention"
          value={String(attentionCount)}
          description="Confirmed participants without ticket references plus everyone still waiting on the waitlist."
          accent="highlight"
        />
        <SummaryCard
          label="Waitlisted participants"
          value={String(waitlistedCount)}
          description="Participants still pending confirmation."
        />
        <SummaryCard
          label="Ticket references ready"
          value={String(issuedTicketCount)}
          description="Registrations that already expose a visible ticket reference."
        />
      </div>

      <DataTableShell
        title="Participant list"
        description="Review participant status and ticket-reference readiness for this event in one place."
        meta={
          <>
            <p className="font-medium">
              {registrations.length} registration{registrations.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Sorted by attention first, then name
            </p>
          </>
        }
        tableMinWidthClassName="min-w-[760px]"
        caption={`Participant registrations for ${eventTitle} with status and ticket readiness.`}
      >
        <thead className="bg-[rgba(12,20,35,0.82)] text-[var(--text-muted)]">
          <tr>
            <th scope="col" className="px-6 py-4 font-medium">Participant</th>
            <th scope="col" className="px-6 py-4 font-medium">Status</th>
            <th scope="col" className="px-6 py-4 font-medium">Ticket readiness</th>
            <th scope="col" className="px-6 py-4 font-medium">Ticket reference</th>
          </tr>
        </thead>
        <tbody>
          {sortedRegistrations.map((registration) => {
            const statusState = resolveOrganizerStatus(registration);
            const ticketState = resolveTicketReadiness(registration);

            return (
              <tr
                key={registration.id}
                className="border-t border-[var(--line-soft)] text-[var(--text-secondary)] align-top"
              >
                <th scope="row" className="px-6 py-5 text-left">
                  <div className="grid gap-2">
                    <p className="font-medium text-[var(--text-primary)]">{registration.participantName}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      Registration ID: {registration.id}
                    </p>
                    <div className="grid gap-1 rounded-[18px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)] px-3 py-2">
                      <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${resolveOrganizerAttention(registration).tone}`}>
                        {resolveOrganizerAttention(registration).title}
                      </p>
                      <p className="text-xs leading-5 text-[var(--text-secondary)]">
                        {resolveOrganizerAttention(registration).description}
                      </p>
                    </div>
                  </div>
                </th>
                <td className="px-6 py-5">
                  <div className="grid gap-2.5">
                    <StatusBadge status={registration.status} />
                    <div className="grid gap-1">
                      <p className={`text-sm font-medium ${statusState.tone}`}>
                        {statusState.title}
                      </p>
                      <p className="text-sm leading-6 text-[var(--text-secondary)]">{statusState.description}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="grid gap-1.5">
                    <p className={`text-sm font-medium ${ticketState.tone}`}>
                      {ticketState.title}
                    </p>
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">{ticketState.description}</p>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="grid gap-1.5">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {registration.ticketRef || "Not issued yet"}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {registration.ticketRef
                        ? "Visible ticket reference for organizer review."
                        : "A reference will appear here once it has been issued."}
                    </p>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </DataTableShell>
    </div>
  );
}
