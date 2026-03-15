"use client";

import { PageTitle } from "@/components/shared/page-title";
import { Card } from "@/components/ui/card";
import { TEMP_ADMIN_EVENTS_NOTICE } from "@/features/admin/api/get-admin-events-temporary";
import { AdminEventsTable } from "@/features/admin/components/admin-events-table";
import { useAdminEventsQuery } from "@/features/admin/hooks/use-admin-events-query";

export default function AdminEventsPage() {
  const { data = [] } = useAdminEventsQuery();

  return (
    <div className="grid gap-6">
      <PageTitle
        eyebrow="Admin"
        title="Admin events"
        description="Administrative events overview. The current data source is temporary until a dedicated admin events backend contract exists."
      />
      <Card className="grid gap-2 border-amber-200 bg-amber-50/80">
        <p className="text-sm font-semibold text-amber-900">Temporary integration</p>
        <p className="text-sm text-amber-800">{TEMP_ADMIN_EVENTS_NOTICE}</p>
      </Card>
      <AdminEventsTable events={data} />
    </div>
  );
}
