"use client";

import { PageTitle } from "@/components/shared/page-title";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAdminEventsQuery } from "@/features/admin/hooks/use-admin-events-query";
import type { AdminEvent } from "@/features/admin/types/admin.types";
import { formatDate } from "@/lib/utils/format-date";

function resolveLifecycleInterpretation(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === "DRAFT") {
    return { label: "Preparation stage", description: "The organizer is still building this event." };
  }
  if (normalized === "PUBLISHED") {
    return { label: "Live to participants", description: "This event is discoverable in the public catalog." };
  }
  if (normalized === "FULL") {
    return { label: "At capacity", description: "All available places are currently filled." };
  }
  if (normalized === "CLOSED") {
    return { label: "Registration closed", description: "The event is no longer accepting new registrations." };
  }
  if (normalized === "CANCELLED") {
    return { label: "Review-only state", description: "This event was cancelled and is no longer active." };
  }
  return { label: status, description: "Check the organizer workspace for full context." };
}

function AdminEventRow({ event }: { event: AdminEvent }) {
  const lifecycle = resolveLifecycleInterpretation(event.status);

  return (
    <div className="grid gap-4 rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.82),rgba(10,17,30,0.92))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <div className="grid gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Event identity</p>
        <h3 className="text-base font-semibold text-[var(--text-primary)]">{event.title}</h3>
        <p className="text-xs text-[var(--text-muted)]">Event ID: {event.id}</p>
        {event.description ? (
          <p className="text-sm leading-6 text-[var(--text-secondary)] line-clamp-2">{event.description}</p>
        ) : null}
      </div>
      <div className="grid gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Location</p>
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {event.city}{event.venue ? ` · ${event.venue}` : ""}
        </p>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)] mt-2">
          Scheduled date
        </p>
        <p className="text-sm text-[var(--text-secondary)]">{formatDate(event.startAt)}</p>
      </div>
      <div className="grid gap-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Lifecycle</p>
        <StatusBadge status={event.status} />
        <p className="text-sm font-medium text-[var(--text-primary)]">{lifecycle.label}</p>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">{lifecycle.description}</p>
      </div>
    </div>
  );
}

export default function AdminEventsPage() {
  const { data = [], isLoading, isError, error } = useAdminEventsQuery();
  const draftCount = data.filter((e) => e.status === "DRAFT").length;
  const publishedCount = data.filter((e) => e.status === "PUBLISHED").length;

  return (
    <div className="grid gap-10">
      <PageTitle
        eyebrow="Admin"
        title="Event management"
        description="Review all platform events, monitor their lifecycle, and cancel events when necessary."
      />

      {/* Limited event overview — always visible */}
      <Card className="grid gap-3 border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.1),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.94),rgba(10,17,30,0.98))] shadow-[0_24px_56px_rgba(0,0,0,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-warm)]">
          Admin limitation notice
        </p>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Limited event overview</h2>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          This view gives a read-only snapshot of platform events. Full event management — including editing, rescheduling, and capacity changes — stays with the organizer workspace.
        </p>
      </Card>

      {isLoading ? (
        <LoadingState label="Loading admin events..." variant="table" />
      ) : isError ? (
        <ErrorState
          title="Could not load admin events"
          description={error instanceof Error ? error.message : "The admin event overview is unavailable right now."}
        />
      ) : data.length === 0 ? (
        <Card className="grid gap-3 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.94),rgba(9,15,26,0.98))]">
          <p className="text-sm font-semibold text-[var(--text-primary)]">No events available</p>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            No events have been created on the platform yet. They will appear here once organizers begin creating drafts.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="grid gap-2.5 border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.1),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Visible events</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{data.length}</h2>
              <p className="text-sm text-[var(--text-secondary)]">All events currently visible in this limited overview.</p>
            </Card>
            <Card className="grid gap-2.5 border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.1),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Draft events</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{draftCount}</h2>
              <p className="text-sm text-[var(--text-secondary)]">Being prepared by organizers.</p>
            </Card>
            <Card className="grid gap-2.5 border-[rgba(52,211,153,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.08),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Published events</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{publishedCount}</h2>
              <p className="text-sm text-[var(--text-secondary)]">Live in the participant catalog.</p>
            </Card>
          </div>

          <Card className="grid gap-5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.94),rgba(9,15,26,0.98))] shadow-[0_24px_56px_rgba(0,0,0,0.28)]">
            <div className="grid gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary-strong)]">
                Limited overview guide
              </p>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Limited event directory</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Counts and rows stay intentionally narrow — this is a monitoring surface, not an editing one.
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Use this table for quick event identity and lifecycle review only. It is intentionally narrow and not a full event-management workspace.
              </p>
            </div>
            <div className="grid gap-3">
              {data.map((event) => (
                <AdminEventRow key={event.id} event={event} />
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
