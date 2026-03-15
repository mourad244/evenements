"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import type { EventFilters } from "../types/event.types";

type EventFiltersProps = {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
};

export function EventFilters({ filters, onChange }: EventFiltersProps) {
  return (
    <div className="grid gap-4 rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-soft md:grid-cols-3">
      <div className="md:col-span-2">
        <Input
          label="Search events"
          placeholder="Search by title or theme"
          value={filters.query || ""}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
        />
      </div>
      <div className="grid items-end">
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white"
        >
          <Search className="h-4 w-4" />
          Explore
        </button>
      </div>
    </div>
  );
}
