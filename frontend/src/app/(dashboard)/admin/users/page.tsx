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
    <div className="grid gap-10">
      <PageTitle
        eyebrow="Admin"
        title="Admin users"
        description="Review platform users and keep track of who has access to the platform."
      />

      {isLoading ? (
        <LoadingState label="Loading admin users..." variant="table" />
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
            <Card className="grid gap-2.5 border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.12),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Total users</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{data.length}</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                All platform accounts currently visible in this admin view.
              </p>
            </Card>
            <Card className="grid gap-2.5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Admins</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{adminCount}</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Accounts with platform oversight access.
              </p>
            </Card>
            <Card className="grid gap-2.5 border-[rgba(243,154,99,0.16)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.1),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Organizers</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{organizerCount}</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Accounts currently managing event workspaces.
              </p>
            </Card>
            <Card className="grid gap-2.5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Participants</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{participantCount}</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Accounts currently using the participant experience.
              </p>
            </Card>
          </div>

          <Card className="grid gap-2.5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.94),rgba(9,15,26,0.98))]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary-strong)]">Admin users</p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">User directory</h2>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Scan identity, access role, and account age from one clean admin table.
            </p>
          </Card>

          <UsersTable users={data} />
        </>
      )}
    </div>
  );
}
