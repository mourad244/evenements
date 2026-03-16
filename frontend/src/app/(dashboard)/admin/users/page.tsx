"use client";

import { PageTitle } from "@/components/shared/page-title";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { UsersTable } from "@/features/admin/components/users-table";
import { useUsersQuery } from "@/features/admin/hooks/use-users-query";

export default function AdminUsersPage() {
  const { data = [], isLoading, isError, error } = useUsersQuery();

  return (
    <div className="grid gap-6">
      <PageTitle
        eyebrow="Admin"
        title="Admin users"
        description="Review platform users and keep track of who has access to the platform."
      />

      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Card className="grid gap-2">
          <h2 className="text-xl font-semibold text-ink">Could not load admin users</h2>
          <p className="text-sm text-slate-600">
            {error instanceof Error ? error.message : "The admin user directory is unavailable right now."}
          </p>
        </Card>
      ) : data.length === 0 ? (
        <EmptyState
          title="No users available"
          description="There are no user records to review at the moment."
        />
      ) : (
        <UsersTable users={data} />
      )}
    </div>
  );
}
