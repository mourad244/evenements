import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/format-date";

import type { AdminEvent } from "../types/admin.types";

export function AdminEventsTable({ events }: { events: AdminEvent[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-6 py-4">Event</th>
            <th className="px-6 py-4">City</th>
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-t border-slate-100 text-slate-700">
              <td className="px-6 py-4 font-medium text-ink">{event.title}</td>
              <td className="px-6 py-4">{event.city}</td>
              <td className="px-6 py-4">{formatDate(event.startAt)}</td>
              <td className="px-6 py-4">{event.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
