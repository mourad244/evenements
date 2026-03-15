import { EmptyState } from "@/components/ui/empty-state";

import type { EventItem } from "../types/event.types";
import { EventCard } from "./event-card";

type EventListProps = {
  events: EventItem[];
};

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No events found"
        description="Adjust the filters or connect the event service to surface more inventory."
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
