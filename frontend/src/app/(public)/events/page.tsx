"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/shared/page-title";
import { Spinner } from "@/components/ui/spinner";
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
        description="Search upcoming experiences and verify that the catalog contract is ready for backend event service integration."
      />
      <EventFilters filters={filters} onChange={setFilters} />
      {isLoading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Card className="text-sm text-slate-600">
          <p className="font-semibold text-ink">Could not load events.</p>
          <p className="mt-2">{error.message}</p>
        </Card>
      ) : (
        <EventList events={data} />
      )}
    </div>
  );
}
