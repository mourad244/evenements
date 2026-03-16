"use client";

import { PageTitle } from "@/components/shared/page-title";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { UnavailableState } from "@/components/ui/unavailable-state";
import { AdminEventsTable } from "@/features/admin/components/admin-events-table";
import { useAdminEventsQuery } from "@/features/admin/hooks/use-admin-events-query";

export default function AdminEventsPage() {
  const { data = [], isLoading, isError, error } = useAdminEventsQuery();
  const noticeTitle = "Limited event overview";
  const noticeBody =
    "This screen currently shows a simplified event list and should not be treated as the full admin event workspace.";
  const draftCount = data.filter((event) => event.status === "DRAFT").length;
  const publishedCount = data.filter((event) => event.status === "PUBLISHED").length;

  return (
    <div className="grid gap-10">
      <PageTitle
        eyebrow="Admin"
        title="Admin events"
        description="Review a limited event overview while the broader admin event workspace is still being prepared."
      />
      <Card className="grid gap-4 border-[rgba(243,154,99,0.22)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.12),transparent_28%),linear-gradient(180deg,rgba(29,20,13,0.92),rgba(16,13,11,0.98))] shadow-[0_28px_64px_rgba(0,0,0,0.32)]">
        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-warm)]">
            Admin limitation notice
          </p>
          <p className="text-base font-semibold text-[var(--text-primary)]">{noticeTitle}</p>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">{noticeBody}</p>
        </div>
        <div className="grid gap-3 rounded-[24px] border border-[rgba(243,154,99,0.16)] bg-[rgba(24,18,14,0.74)] p-4 text-sm text-[var(--text-secondary)]">
          <p>
            Available now: a basic event list for quick review and high-level lifecycle scanning.
          </p>
          <p>
            Not included here yet: broader admin oversight, metrics, or deeper event controls.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="ghost" disabled className="w-full justify-center sm:w-auto">
            Limited overview only
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <LoadingState label="Loading admin events..." variant="table" />
      ) : isError ? (
        <ErrorState
          title="Could not load admin events"
          description={
            error instanceof Error
              ? error.message
              : "The event overview is unavailable right now."
          }
        />
      ) : data.length === 0 ? (
        <UnavailableState
          title="No events available"
          description="There are no event records to review at the moment."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="grid gap-2.5 border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.1),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Visible events</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{data.length}</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Events currently visible in this limited admin overview.
              </p>
            </Card>
            <Card className="grid gap-2.5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Draft events</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{draftCount}</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Drafts that are still in preparation.
              </p>
            </Card>
            <Card className="grid gap-2.5 border-[rgba(88,116,255,0.16)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.1),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Published events</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{publishedCount}</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Events that are already live to participants.
              </p>
            </Card>
          </div>

          <Card className="grid gap-2.5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.94),rgba(9,15,26,0.98))]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-warm)]">Admin events</p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Limited event directory</h2>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Use this table for quick event identity and lifecycle review only.
            </p>
          </Card>

          <AdminEventsTable events={data} />
        </>
      )}
    </div>
  );
}
