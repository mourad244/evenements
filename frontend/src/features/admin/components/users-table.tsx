import { DataTableShell } from "@/components/shared/data-table-shell";
import { formatDate } from "@/lib/utils/format-date";

import type { AdminUser } from "../types/admin.types";

function formatRoleLabel(role: AdminUser["role"]) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export function UsersTable({ users }: { users: AdminUser[] }) {
  const sortedUsers = [...users].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
  );

  return (
    <DataTableShell
      title="User list"
      description="Review identity, access role, and account age in one admin table."
      meta={
        <>
          <p className="font-medium">
            {users.length} visible user{users.length === 1 ? "" : "s"}
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Newest accounts first
          </p>
        </>
      }
      tableMinWidthClassName="min-w-[760px]"
      caption="Platform users with role and account creation date"
    >
      <thead className="bg-[rgba(12,20,35,0.82)] text-[var(--text-muted)]">
        <tr>
          <th scope="col" className="px-4 py-4 font-medium sm:px-6">
            User identity
          </th>
          <th scope="col" className="px-4 py-4 font-medium sm:px-6">
            Access role
          </th>
          <th scope="col" className="px-4 py-4 font-medium sm:px-6">
            Added
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedUsers.map((user) => (
          <tr key={user.id} className="border-t border-[var(--line-soft)] text-[var(--text-secondary)] align-top">
            <th scope="row" className="px-4 py-5 text-left sm:px-6">
              <div className="grid gap-2">
                <span className="font-medium text-[var(--text-primary)]">{user.fullName}</span>
                <span className="break-all text-sm text-[var(--text-secondary)] sm:break-normal">
                  {user.email}
                </span>
                <span className="text-xs text-[var(--text-muted)]">User ID: {user.id}</span>
              </div>
            </th>
            <td className="px-4 py-5 sm:px-6">
              <div className="grid gap-1.5">
                <span className="font-medium text-[var(--text-primary)]">{formatRoleLabel(user.role)}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  Current platform access level
                </span>
              </div>
            </td>
            <td className="px-4 py-5 sm:px-6">
              <div className="grid gap-1.5 whitespace-nowrap">
                <span className="font-medium text-[var(--text-primary)]">{formatDate(user.createdAt)}</span>
                <span className="text-xs text-[var(--text-muted)]">
                  Account creation date
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </DataTableShell>
  );
}
