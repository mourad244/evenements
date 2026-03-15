import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/format-date";

import type { AdminUser } from "../types/admin.types";

export function UsersTable({ users }: { users: AdminUser[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-6 py-4">User</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Created</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-slate-100 text-slate-700">
              <td className="px-6 py-4">
                <div className="grid gap-1">
                  <span className="font-medium text-ink">{user.fullName}</span>
                  <span>{user.email}</span>
                </div>
              </td>
              <td className="px-6 py-4">{user.role}</td>
              <td className="px-6 py-4">{formatDate(user.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
