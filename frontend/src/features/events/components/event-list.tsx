import { EmptyState } from "@/components/ui/empty-state";

import type { EventItem } from "../types/event.types";
import { EventCard } from "./event-card";

type EventListProps = {
  events: EventItem[];
  sortBy?: "soonest" | "latest" | "price-low" | "price-high" | "title";
  hasQuery?: boolean;
  query?: string;
  totalCount?: number;
};

function getSortLabel(sortBy: NonNullable<EventListProps["sortBy"]>) {
  if (sortBy === "latest") {
    return "Latest first";
  }

  if (sortBy === "price-low") {
    return "Lowest price";
  }

  if (sortBy === "price-high") {
    return "Highest price";
  }

  if (sortBy === "title") {
    return "Title A-Z";
  }

  return "Soonest first";
}

export function EventList({
  events,
  sortBy = "soonest",
  hasQuery = false,
  query,
  totalCount = events.length
}: EventListProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No events found"
        description={
          hasQuery
            ? `No visible events match "${query}". Try a broader search or reset the sort order.`
            : "Adjust the catalog view to surface more visible events."
        }
      />
    );
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.9),rgba(10,17,30,0.98))] px-5 py-4 shadow-[0_22px_50px_rgba(0,0,0,0.24)] sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary-strong)]">
            Catalog view
          </p>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {events.length} event{events.length === 1 ? "" : "s"} ready to explore
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Showing {events.length} of {totalCount} visible catalog event{totalCount === 1 ? "" : "s"}
            {hasQuery && query ? ` for "${query}"` : ""}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="rounded-full border border-[var(--line-soft)] bg-[rgba(12,20,35,0.72)] px-3 py-1.5 text-[var(--text-secondary)]">
            Sorted by <span className="font-semibold text-[var(--text-primary)]">{getSortLabel(sortBy)}</span>
          </span>
          {hasQuery && query ? (
            <span className="rounded-full border border-[rgba(88,116,255,0.2)] bg-[rgba(88,116,255,0.12)] px-3 py-1.5 text-[var(--text-primary)]">
              Search active
            </span>
          ) : null}
        </div>
      </div>
      <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
