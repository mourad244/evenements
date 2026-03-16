"use client";

import { PageTitle } from "@/components/shared/page-title";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  TEMP_ADMIN_EVENTS_NOTICE,
  TEMP_ADMIN_EVENTS_SOURCE_LABEL
} from "@/features/admin/api/get-admin-events-temporary";
import { AdminEventsTable } from "@/features/admin/components/admin-events-table";
import { useAdminEventsQuery } from "@/features/admin/hooks/use-admin-events-query";

export default function AdminEventsPage() {
  const { data = [], isLoading, isError, error } = useAdminEventsQuery();
  const noticeTitle = "Limited event overview";
  const noticeBody =
    "This page is still limited and does not yet represent the full admin event oversight experience.";

  return (
    <div className="grid gap-6">
      <PageTitle
        eyebrow="Admin"
        title="Admin events"
        description="Review the current event list from an administrative point of view."
      />
      <Card className="grid gap-2 border-amber-200 bg-amber-50/80">
        <p className="text-sm font-semibold text-amber-900">{noticeTitle}</p>
        <p className="text-sm text-amber-800">{noticeBody}</p>
      </Card>

      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Card className="grid gap-2">
          <h2 className="text-xl font-semibold text-ink">Could not load admin events</h2>
          <p className="text-sm text-slate-600">
            {error instanceof Error
              ? error.message
              : "The event overview is unavailable right now."}
          </p>
        </Card>
      ) : data.length === 0 ? (
        <Card className="grid gap-2">
          <h2 className="text-xl font-semibold text-ink">No events available</h2>
          <p className="text-sm text-slate-600">
            There are no event records to review at the moment.
          </p>
        </Card>
      ) : (
        <AdminEventsTable events={data} />
      )}
    </div>
  );
}
