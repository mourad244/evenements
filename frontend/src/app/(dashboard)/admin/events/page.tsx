"use client";

import { PageTitle } from "@/components/shared/page-title";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { UnavailableState } from "@/components/ui/unavailable-state";
import { AdminEventsTable } from "@/features/admin/components/admin-events-table";
import { useAdminEventsQuery } from "@/features/admin/hooks/use-admin-events-query";

export default function AdminEventsPage() {
  const { data = [], isLoading, isError, error } = useAdminEventsQuery();
  const draftCount = data.filter((e) => e.status === "DRAFT").length;
  const publishedCount = data.filter((e) => e.status === "PUBLISHED").length;
  const cancelledCount = data.filter((e) => e.status === "CANCELLED").length;

  return (
    <div className="grid gap-10">
      <PageTitle
        eyebrow="Admin"
        title="Event management"
        description="Review all platform events, monitor their lifecycle, and cancel events when necessary."
      />

      {isLoading ? (
        <LoadingState label="Loading events..." variant="table" />
      ) : isError ? (
        <ErrorState
          title="Could not load events"
          description={error instanceof Error ? error.message : "The event directory is unavailable right now."}
        />
      ) : data.length === 0 ? (
        <UnavailableState
          title="No events yet"
          description="No events have been created on the platform yet."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="grid gap-2.5 border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.1),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Total events</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{data.length}</h2>
              <p className="text-sm text-[var(--text-secondary)]">All events across the platform.</p>
            </Card>
            <Card className="grid gap-2.5 border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.1),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Drafts</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{draftCount}</h2>
              <p className="text-sm text-[var(--text-secondary)]">Being prepared by organizers.</p>
            </Card>
            <Card className="grid gap-2.5 border-[rgba(52,211,153,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.08),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Published</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{publishedCount}</h2>
              <p className="text-sm text-[var(--text-secondary)]">Live in the participant catalog.</p>
            </Card>
            <Card className="grid gap-2.5 border-[rgba(251,113,133,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.06),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Cancelled</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{cancelledCount}</h2>
              <p className="text-sm text-[var(--text-secondary)]">No longer active.</p>
            </Card>
          </div>

          <AdminEventsTable events={data} />
        </>
      )}
    </div>
  );
}
