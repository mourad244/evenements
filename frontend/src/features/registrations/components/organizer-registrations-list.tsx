import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";

import type { OrganizerRegistrationItem } from "../types/registration.types";

type OrganizerRegistrationsListProps = {
  eventTitle: string;
  registrations: OrganizerRegistrationItem[];
};

function resolveOrganizerStatus(registration: OrganizerRegistrationItem) {
  if (registration.status === "CONFIRMED") {
    return {
      title: "Confirmed participation",
      description: "This participant currently holds a confirmed place for the event.",
      tone: "text-emerald-700"
    };
  }

  if (registration.status === "WAITLISTED") {
    return {
      title: "Waitlisted",
      description: "This participant is still waiting for a confirmed place to open up.",
      tone: "text-amber-700"
    };
  }

  if (registration.status === "REJECTED") {
    return {
      title: "Not accepted",
      description: "This registration did not move forward into participation.",
      tone: "text-rose-700"
    };
  }

  return {
    title: "Cancelled",
    description: "This registration is no longer active for the event.",
    tone: "text-slate-700"
  };
}

function resolveTicketReadiness(registration: OrganizerRegistrationItem) {
  if (registration.ticketRef) {
    return {
      title: "Ticket reference available",
      description: "A ticket reference has already been issued for this registration.",
      tone: "text-emerald-700"
    };
  }

  if (registration.status === "WAITLISTED") {
    return {
      title: "Waiting for confirmation",
      description: "Ticket readiness will only appear after the participant moves out of the waitlist.",
      tone: "text-amber-700"
    };
  }

  if (registration.status === "CANCELLED" || registration.status === "REJECTED") {
    return {
      title: "No ticket reference",
      description: "Inactive registrations do not expose a ticket reference.",
      tone: "text-slate-700"
    };
  }

  return {
    title: "Ticket reference pending",
    description: "This participant is confirmed, but a ticket reference is not visible yet.",
    tone: "text-slate-700"
  };
}

export function OrganizerRegistrationsList({
  eventTitle,
  registrations
}: OrganizerRegistrationsListProps) {
  const confirmedCount = registrations.filter(
    (registration) => registration.status === "CONFIRMED"
  ).length;
  const waitlistedCount = registrations.filter(
    (registration) => registration.status === "WAITLISTED"
  ).length;
  const issuedTicketCount = registrations.filter(
    (registration) => registration.ticketRef !== null
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
        <Card className="grid gap-2">
          <p className="text-sm text-slate-500">Confirmed participants</p>
          <h2 className="text-3xl font-semibold text-ink">{confirmedCount}</h2>
          <p className="text-sm text-slate-600">
            Participants currently confirmed for this event.
          </p>
        </Card>
        <Card className="grid gap-2">
          <p className="text-sm text-slate-500">Waitlisted participants</p>
          <h2 className="text-3xl font-semibold text-ink">{waitlistedCount}</h2>
          <p className="text-sm text-slate-600">
            Participants still pending confirmation.
          </p>
        </Card>
        <Card className="grid gap-2">
          <p className="text-sm text-slate-500">Issued ticket references</p>
          <h2 className="text-3xl font-semibold text-ink">{issuedTicketCount}</h2>
          <p className="text-sm text-slate-600">
            Registrations that already expose a visible ticket reference.
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="grid gap-3 border-b border-slate-100 px-6 py-5 sm:flex sm:items-end sm:justify-between">
          <div className="grid gap-1">
            <h2 className="text-lg font-semibold text-ink">Participant list</h2>
            <p className="text-sm text-slate-600">
              Review participant status and ticket-reference readiness for this event in one place.
            </p>
          </div>
          <p className="text-sm font-medium text-slate-500">
            {registrations.length} registration{registrations.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="-mx-1 overflow-x-auto px-1">
          <table className="min-w-[680px] text-left text-sm">
            <caption className="sr-only">
              Participant registrations for {eventTitle} with status and ticket readiness.
            </caption>
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">Participant</th>
                <th scope="col" className="px-6 py-4 font-medium">Status</th>
                <th scope="col" className="px-6 py-4 font-medium">Ticket readiness</th>
                <th scope="col" className="px-6 py-4 font-medium">Ticket reference</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((registration) => {
                const statusState = resolveOrganizerStatus(registration);
                const ticketState = resolveTicketReadiness(registration);

                return (
                  <tr
                    key={registration.id}
                    className="border-t border-slate-100 text-slate-700 align-top"
                  >
                    <th scope="row" className="px-6 py-4 text-left">
                      <div className="grid gap-1.5">
                        <p className="font-medium text-ink">{registration.participantName}</p>
                        <p className="text-xs text-slate-500">
                          Registration ID: {registration.id}
                        </p>
                      </div>
                    </th>
                    <td className="px-6 py-4">
                      <div className="grid gap-2">
                        <StatusBadge status={registration.status} />
                        <div className="grid gap-1">
                          <p className={`text-sm font-medium ${statusState.tone}`}>
                            {statusState.title}
                          </p>
                          <p className="text-sm text-slate-600">{statusState.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="grid gap-1">
                        <p className={`text-sm font-medium ${ticketState.tone}`}>
                          {ticketState.title}
                        </p>
                        <p className="text-sm text-slate-600">{ticketState.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="grid gap-1">
                        <p className="text-sm font-medium text-ink">
                          {registration.ticketRef || "Not issued yet"}
                        </p>
                        <p className="text-xs text-slate-500">
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
          </table>
        </div>
      </Card>
    </div>
  );
}
