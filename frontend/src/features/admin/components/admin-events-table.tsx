import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/format-date";

import type { AdminEvent } from "../types/admin.types";

export function AdminEventsTable({ events }: { events: AdminEvent[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="min-w-[760px] text-left text-sm">
          <caption className="sr-only">Event overview with identity, location, scheduled date, and lifecycle status</caption>
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-4 font-medium sm:px-6">
                Event identity
              </th>
              <th scope="col" className="px-4 py-4 font-medium sm:px-6">
                Location
              </th>
              <th scope="col" className="px-4 py-4 font-medium sm:px-6">
                Scheduled date
              </th>
              <th scope="col" className="px-4 py-4 font-medium sm:px-6">
                Lifecycle
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t border-slate-100 text-slate-700 align-top">
                <th scope="row" className="px-4 py-4 text-left sm:px-6">
                  <div className="grid gap-1.5">
                    <span className="font-medium text-ink">{event.title}</span>
                    <span className="line-clamp-2 text-sm text-slate-600">{event.description}</span>
                    <span className="text-xs text-slate-500">Event ID: {event.id}</span>
                  </div>
                </th>
                <td className="px-4 py-4 sm:px-6">
                  <div className="grid gap-1">
                    <span className="font-medium text-ink">{event.city}</span>
                    <span className="text-xs text-slate-500">{event.venue}</span>
                  </div>
                </td>
                <td className="px-4 py-4 sm:px-6">
                  <div className="grid gap-1 whitespace-nowrap">
                    <span className="font-medium text-ink">{formatDate(event.startAt)}</span>
                    <span className="text-xs text-slate-500">Scheduled start</span>
                  </div>
                </td>
                <td className="px-4 py-4 sm:px-6">
                  <div className="grid gap-2">
                    <StatusBadge status={event.status} />
                    <span className="text-xs text-slate-500">
                      Current event lifecycle state
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
