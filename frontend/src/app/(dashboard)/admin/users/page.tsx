"use client";

import { PageTitle } from "@/components/shared/page-title";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { UsersTable } from "@/features/admin/components/users-table";
import { useUsersQuery } from "@/features/admin/hooks/use-users-query";

export default function AdminUsersPage() {
  const { data = [], isLoading, isError, error } = useUsersQuery();
  const adminCount = data.filter((user) => user.role === "ADMIN").length;
  const organizerCount = data.filter((user) => user.role === "ORGANIZER").length;
  const participantCount = data.filter((user) => user.role === "PARTICIPANT").length;

  return (
    <div className="grid gap-8">
      <PageTitle
        eyebrow="Admin"
        title="Admin users"
        description="Review platform users and keep track of who has access to the platform."
      />

      {isLoading ? (
        <LoadingState label="Loading admin users..." />
      ) : isError ? (
        <ErrorState
          title="Could not load admin users"
          description={
            error instanceof Error
              ? error.message
              : "The admin user directory is unavailable right now."
          }
        />
      ) : data.length === 0 ? (
        <EmptyState
          title="No users available"
          description="There are no user records to review at the moment."
          align="left"
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="grid gap-2.5">
              <p className="text-sm text-slate-500">Total users</p>
              <h2 className="text-2xl font-semibold text-ink">{data.length}</h2>
              <p className="text-sm text-slate-600">
                All platform accounts currently visible in this admin view.
              </p>
            </Card>
            <Card className="grid gap-2.5">
              <p className="text-sm text-slate-500">Admins</p>
              <h2 className="text-2xl font-semibold text-ink">{adminCount}</h2>
              <p className="text-sm text-slate-600">
                Accounts with platform oversight access.
              </p>
            </Card>
            <Card className="grid gap-2.5">
              <p className="text-sm text-slate-500">Organizers</p>
              <h2 className="text-2xl font-semibold text-ink">{organizerCount}</h2>
              <p className="text-sm text-slate-600">
                Accounts currently managing event workspaces.
              </p>
            </Card>
            <Card className="grid gap-2.5">
              <p className="text-sm text-slate-500">Participants</p>
              <h2 className="text-2xl font-semibold text-ink">{participantCount}</h2>
              <p className="text-sm text-slate-600">
                Accounts currently using the participant experience.
              </p>
            </Card>
          </div>

          <Card className="grid gap-2.5">
            <h2 className="text-lg font-semibold text-ink">User directory</h2>
            <p className="text-sm text-slate-600">
              Scan identity, access role, and account age from one clean admin table.
            </p>
          </Card>

          <UsersTable users={data} />
        </>
      )}
    </div>
  );
}
