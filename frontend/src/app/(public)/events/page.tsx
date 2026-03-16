"use client";

import { useMemo, useState } from "react";

import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageTitle } from "@/components/shared/page-title";
import { EventFilters } from "@/features/events/components/event-filters";
import { EventList } from "@/features/events/components/event-list";
import { useEventsQuery } from "@/features/events/hooks/use-events-query";
import type { EventFilters as EventFiltersState } from "@/features/events/types/event.types";

type EventSortOption = "soonest" | "latest" | "price-low" | "price-high" | "title";

function matchesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query);
}

export default function EventsPage() {
  const [filters, setFilters] = useState<EventFiltersState>({ query: "" });
  const [sortBy, setSortBy] = useState<EventSortOption>("soonest");
  const { data = [], isLoading, isError, error } = useEventsQuery(filters);
  const query = (filters.query || "").trim().toLowerCase();

  const visibleEvents = useMemo(() => {
    const filtered = data.filter((event) => {
      if (!query) {
        return true;
      }

      return [
        event.title,
        event.description,
        event.theme,
        event.city,
        event.venue
      ].some((value) => matchesQuery(value, query));
    });

    return [...filtered].sort((left, right) => {
      if (sortBy === "latest") {
        return Date.parse(right.startAt) - Date.parse(left.startAt);
      }

      if (sortBy === "price-low") {
        return left.price - right.price;
      }

      if (sortBy === "price-high") {
        return right.price - left.price;
      }

      if (sortBy === "title") {
        return left.title.localeCompare(right.title);
      }

      return Date.parse(left.startAt) - Date.parse(right.startAt);
    });
  }, [data, query, sortBy]);

  return (
    <div className="grid gap-10">
      <section className="relative overflow-hidden rounded-[36px] border border-[var(--line-soft)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(243,154,99,0.12),transparent_24%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(8,14,24,0.98))] px-6 py-8 shadow-[0_32px_70px_rgba(0,0,0,0.34)] sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]" />
        <PageTitle
          eyebrow="Public catalog"
          title="Discover events built for ambitious communities."
          description="Search upcoming experiences, explore what fits your interests, and plan your next event."
        />
      </section>
      <section className="rounded-[32px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.92),rgba(9,15,26,0.98))] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.28)] sm:p-5">
        <EventFilters
          filters={filters}
          onChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          resultCount={visibleEvents.length}
          totalCount={data.length}
        />
      </section>
      {isLoading ? (
        <LoadingState label="Loading events..." minHeightClassName="min-h-[30vh]" variant="catalog" />
      ) : isError ? (
        <ErrorState title="Could not load events" description={error.message} />
      ) : (
        <EventList
          events={visibleEvents}
          sortBy={sortBy}
          hasQuery={Boolean(query)}
        />
      )}
    </div>
  );
}
