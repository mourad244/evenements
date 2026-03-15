import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";

import type { OrganizerRegistrationItem } from "../types/registration.types";

type OrganizerRegistrationsListProps = {
  eventTitle: string;
  registrations: OrganizerRegistrationItem[];
};

export function OrganizerRegistrationsList({
  eventTitle,
  registrations
}: OrganizerRegistrationsListProps) {
  if (registrations.length === 0) {
    return (
      <EmptyState
        title="No participants yet"
        description={`Registrations for ${eventTitle} will appear here as soon as participants confirm or join the waitlist.`}
      />
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-3 border-b border-slate-100 px-6 py-5 sm:flex sm:items-end sm:justify-between">
        <div className="grid gap-1">
          <h2 className="text-lg font-semibold text-ink">Participant list</h2>
          <p className="text-sm text-slate-600">
            Track participant status and ticket references for this event.
          </p>
        </div>
        <p className="text-sm font-medium text-slate-500">
          {registrations.length} registration{registrations.length > 1 ? "s" : ""}
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Participant</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Ticket reference</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((registration) => (
              <tr
                key={registration.id}
                className="border-t border-slate-100 text-slate-700"
              >
                <td className="px-6 py-4 font-medium text-ink">
                  {registration.participantName}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={registration.status} />
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {registration.ticketRef || "Not issued yet"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
