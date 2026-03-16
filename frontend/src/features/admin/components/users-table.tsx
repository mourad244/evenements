import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/format-date";

import type { AdminUser } from "../types/admin.types";

function formatRoleLabel(role: AdminUser["role"]) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export function UsersTable({ users }: { users: AdminUser[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="min-w-[700px] text-left text-sm">
          <caption className="sr-only">Platform users with role and account creation date</caption>
          <thead className="bg-slate-50 text-slate-500">
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
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100 text-slate-700 align-top">
                <th scope="row" className="px-4 py-4 text-left sm:px-6">
                  <div className="grid gap-1.5">
                    <span className="font-medium text-ink">{user.fullName}</span>
                    <span className="break-all text-sm text-slate-600 sm:break-normal">
                      {user.email}
                    </span>
                    <span className="text-xs text-slate-500">User ID: {user.id}</span>
                  </div>
                </th>
                <td className="px-4 py-4 sm:px-6">
                  <div className="grid gap-1">
                    <span className="font-medium text-ink">{formatRoleLabel(user.role)}</span>
                    <span className="text-xs text-slate-500">
                      Current platform access level
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 sm:px-6">
                  <div className="grid gap-1 whitespace-nowrap">
                    <span className="font-medium text-ink">{formatDate(user.createdAt)}</span>
                    <span className="text-xs text-slate-500">
                      Account creation date
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
