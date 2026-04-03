"use client";

import { useState } from "react";

import { DataTableShell } from "@/components/shared/data-table-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { useCancelEventMutation } from "@/features/events/hooks/use-cancel-event-mutation";
import { formatDate } from "@/lib/utils/format-date";

import type { AdminEvent } from "../types/admin.types";

export function AdminEventsTable({ events }: { events: AdminEvent[] }) {
  const mutation = useCancelEventMutation();
  const [feedback, setFeedback] = useState<{ id: string; tone: "success" | "error"; text: string } | null>(null);

  const sortedEvents = [...events].sort((left, right) => {
    const statusRank = { DRAFT: 0, PUBLISHED: 1, CANCELLED: 2 } as const;
    const rankDifference = statusRank[left.status] - statusRank[right.status];
    if (rankDifference !== 0) return rankDifference;
    return Date.parse(left.startAt) - Date.parse(right.startAt);
  });

  return (
    <div className="grid gap-3">
      {feedback ? (
        <p
          className={`rounded-[22px] border px-4 py-3 text-sm ${
            feedback.tone === "success"
              ? "border-[rgba(52,211,153,0.22)] bg-[rgba(6,78,59,0.3)] text-[var(--status-success)]"
              : "border-[rgba(251,113,133,0.24)] bg-[rgba(127,29,29,0.26)] text-[var(--status-danger)]"
          }`}
        >
          {feedback.text}
        </p>
      ) : null}
      <DataTableShell
        title="All platform events"
        description="Full event directory across all organizers. Cancel published events when required."
        meta={
          <>
            <p className="font-medium">
              {events.length} event{events.length === 1 ? "" : "s"}
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Sorted by status, then date
            </p>
          </>
        }
        tableMinWidthClassName="min-w-[900px]"
        caption="Admin event directory with identity, location, schedule, status, and cancel action"
      >
        <thead className="bg-[rgba(12,20,35,0.82)] text-[var(--text-muted)]">
          <tr>
            <th scope="col" className="px-4 py-4 font-medium sm:px-6">Event</th>
            <th scope="col" className="px-4 py-4 font-medium sm:px-6">Location</th>
            <th scope="col" className="px-4 py-4 font-medium sm:px-6">Date</th>
            <th scope="col" className="px-4 py-4 font-medium sm:px-6">Status</th>
            <th scope="col" className="px-4 py-4 font-medium sm:px-6">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedEvents.map((event) => {
            const isCancelling = mutation.isPending && mutation.variables === event.id;
            return (
              <tr key={event.id} className="border-t border-[var(--line-soft)] text-[var(--text-secondary)] align-top">
                <th scope="row" className="px-4 py-5 text-left sm:px-6">
                  <div className="grid gap-1.5">
                    <span className="font-medium text-[var(--text-primary)]">{event.title}</span>
                    <span className="line-clamp-2 text-xs text-[var(--text-secondary)]">{event.description}</span>
                    <span className="text-xs text-[var(--text-muted)]">ID: {event.id}</span>
                  </div>
                </th>
                <td className="px-4 py-5 sm:px-6">
                  <div className="grid gap-1">
                    <span className="font-medium text-[var(--text-primary)]">{event.city}</span>
                    <span className="text-xs text-[var(--text-muted)]">{event.venue}</span>
                  </div>
                </td>
                <td className="px-4 py-5 sm:px-6 whitespace-nowrap">
                  <span className="font-medium text-[var(--text-primary)]">{formatDate(event.startAt)}</span>
                </td>
                <td className="px-4 py-5 sm:px-6">
                  <StatusBadge status={event.status} />
                </td>
                <td className="px-4 py-5 sm:px-6">
                  <Button
                    variant="danger"
                    onClick={async () => {
                      setFeedback(null);
                      try {
                        await mutation.mutateAsync(event.id);
                        setFeedback({ id: event.id, tone: "success", text: `"${event.title}" has been cancelled.` });
                      } catch (err) {
                        setFeedback({
                          id: event.id,
                          tone: "error",
                          text: err instanceof Error ? err.message : "Could not cancel this event."
                        });
                      }
                    }}
                    disabled={event.status === "CANCELLED" || isCancelling}
                  >
                    {isCancelling ? "Cancelling…" : event.status === "CANCELLED" ? "Cancelled" : "Cancel"}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </DataTableShell>
    </div>
  );
}
