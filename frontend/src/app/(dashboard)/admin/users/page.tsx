"use client";

import { PageTitle } from "@/components/shared/page-title";
import { UsersTable } from "@/features/admin/components/users-table";
import { useUsersQuery } from "@/features/admin/hooks/use-users-query";

export default function AdminUsersPage() {
  const { data = [] } = useUsersQuery();

  return (
    <div className="grid gap-6">
      <PageTitle
        eyebrow="Admin"
        title="Admin users"
        description="Review platform users with a simple, typed table."
      />
      <UsersTable users={data} />
    </div>
  );
}
