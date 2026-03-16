"use client";

import { useState } from "react";

import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageTitle } from "@/components/shared/page-title";
import { EventFilters } from "@/features/events/components/event-filters";
import { EventList } from "@/features/events/components/event-list";
import { useEventsQuery } from "@/features/events/hooks/use-events-query";
import type { EventFilters as EventFiltersState } from "@/features/events/types/event.types";

export default function EventsPage() {
  const [filters, setFilters] = useState<EventFiltersState>({ query: "" });
  const { data = [], isLoading, isError, error } = useEventsQuery(filters);

  return (
    <div className="grid gap-8">
      <PageTitle
        eyebrow="Public catalog"
        title="Discover events built for ambitious communities."
        description="Search upcoming experiences, explore what fits your interests, and plan your next event."
      />
      <EventFilters filters={filters} onChange={setFilters} />
      {isLoading ? (
        <LoadingState label="Loading events..." minHeightClassName="min-h-[30vh]" />
      ) : isError ? (
        <ErrorState title="Could not load events" description={error.message} />
      ) : (
        <EventList events={data} />
      )}
    </div>
  );
}
