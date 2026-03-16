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
    <div className="grid gap-8">
      <PageTitle
        eyebrow="Admin"
        title="Admin events"
        description="Review a limited event overview while the broader admin event workspace is still being prepared."
      />
      <Card className="grid gap-4 border-amber-200 bg-amber-50/80">
        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-900">
            Admin limitation notice
          </p>
          <p className="text-base font-semibold text-amber-950">{noticeTitle}</p>
          <p className="text-sm leading-6 text-amber-800">{noticeBody}</p>
        </div>
        <div className="grid gap-3 rounded-2xl border border-amber-200/80 bg-white/70 p-4 text-sm text-amber-950">
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
        <LoadingState label="Loading admin events..." />
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
            <Card className="grid gap-2.5">
              <p className="text-sm text-slate-500">Visible events</p>
              <h2 className="text-2xl font-semibold text-ink">{data.length}</h2>
              <p className="text-sm text-slate-600">
                Events currently visible in this limited admin overview.
              </p>
            </Card>
            <Card className="grid gap-2.5">
              <p className="text-sm text-slate-500">Draft events</p>
              <h2 className="text-2xl font-semibold text-ink">{draftCount}</h2>
              <p className="text-sm text-slate-600">
                Drafts that are still in preparation.
              </p>
            </Card>
            <Card className="grid gap-2.5">
              <p className="text-sm text-slate-500">Published events</p>
              <h2 className="text-2xl font-semibold text-ink">{publishedCount}</h2>
              <p className="text-sm text-slate-600">
                Events that are already live to participants.
              </p>
            </Card>
          </div>

          <Card className="grid gap-2.5">
            <h2 className="text-lg font-semibold text-ink">Limited event directory</h2>
            <p className="text-sm text-slate-600">
              Use this table for quick event identity and lifecycle review only.
            </p>
          </Card>

          <AdminEventsTable events={data} />
        </>
      )}
    </div>
  );
}
