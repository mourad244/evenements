import { DataTableShell } from "@/components/shared/data-table-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils/format-date";

import type { AdminEvent } from "../types/admin.types";

function resolveLifecycleCue(status: AdminEvent["status"]) {
  if (status === "DRAFT") {
    return {
      title: "Preparation stage",
      description: "This event is still being prepared and is not yet live to participants.",
      tone: "text-[var(--status-warning)]"
    };
  }

  if (status === "PUBLISHED") {
    return {
      title: "Live to participants",
      description: "This event is currently visible in the participant-facing catalog.",
      tone: "text-[var(--status-success)]"
    };
  }

  return {
    title: "Review-only state",
    description: "This event is outside the main live workflow and remains visible here only for limited review.",
    tone: "text-[var(--text-primary)]"
  };
}

export function AdminEventsTable({ events }: { events: AdminEvent[] }) {
  const sortedEvents = [...events].sort((left, right) => {
    const statusRank = {
      DRAFT: 0,
      PUBLISHED: 1,
      CANCELLED: 2
    } as const;

    const rankDifference = statusRank[left.status] - statusRank[right.status];

    if (rankDifference !== 0) {
      return rankDifference;
    }

    return Date.parse(left.startAt) - Date.parse(right.startAt);
  });

  return (
    <DataTableShell
      title="Event list"
      description="Scan event identity, place, date, and lifecycle from one limited admin table."
      meta={
        <>
          <p className="font-medium">
            {events.length} visible event{events.length === 1 ? "" : "s"}
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Sorted by lifecycle, then date
          </p>
        </>
      }
      tableMinWidthClassName="min-w-[820px]"
      caption="Event overview with identity, location, scheduled date, and lifecycle status"
    >
      <thead className="bg-[rgba(12,20,35,0.82)] text-[var(--text-muted)]">
        <tr>
          <th scope="col" className="px-4 py-4 font-medium sm:px-6">
            Event identity
          </th>
          <th scope="col" className="px-4 py-4 font-medium sm:px-6">
            Location
          </th>
          <th scope="col" className="px-4 py-4 font-medium sm:px-6">
            Scheduled date
          </th>
          <th scope="col" className="px-4 py-4 font-medium sm:px-6">
            Lifecycle
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedEvents.map((event) => (
          <tr key={event.id} className="border-t border-[var(--line-soft)] text-[var(--text-secondary)] align-top">
            <th scope="row" className="px-4 py-5 text-left sm:px-6">
              <div className="grid gap-2">
                <span className="font-medium text-[var(--text-primary)]">{event.title}</span>
                <span className="line-clamp-2 text-sm text-[var(--text-secondary)]">{event.description}</span>
                <span className="text-xs text-[var(--text-muted)]">Event ID: {event.id}</span>
              </div>
            </th>
            <td className="px-4 py-5 sm:px-6">
              <div className="grid gap-1.5">
                <span className="font-medium text-[var(--text-primary)]">{event.city}</span>
                <span className="text-xs text-[var(--text-muted)]">{event.venue}</span>
              </div>
            </td>
            <td className="px-4 py-5 sm:px-6">
              <div className="grid gap-1.5 whitespace-nowrap">
                <span className="font-medium text-[var(--text-primary)]">{formatDate(event.startAt)}</span>
                <span className="text-xs text-[var(--text-muted)]">Scheduled start</span>
              </div>
            </td>
            <td className="px-4 py-5 sm:px-6">
              <div className="grid gap-2.5">
                <StatusBadge status={event.status} />
                <div className="grid gap-1 rounded-[18px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)] px-3 py-2">
                  <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${resolveLifecycleCue(event.status).tone}`}>
                    {resolveLifecycleCue(event.status).title}
                  </span>
                  <span className="text-xs leading-5 text-[var(--text-muted)]">
                    {resolveLifecycleCue(event.status).description}
                  </span>
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </DataTableShell>
  );
}
