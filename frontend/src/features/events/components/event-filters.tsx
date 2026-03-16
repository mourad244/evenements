"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import type { EventFilters } from "../types/event.types";

type EventSortOption = "soonest" | "latest" | "price-low" | "price-high" | "title";

type EventFiltersProps = {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
  sortBy: EventSortOption;
  onSortChange: (value: EventSortOption) => void;
  resultCount: number;
  totalCount: number;
};

const SORT_OPTIONS: Array<{ value: EventSortOption; label: string }> = [
  { value: "soonest", label: "Soonest first" },
  { value: "latest", label: "Latest first" },
  { value: "price-low", label: "Lowest price" },
  { value: "price-high", label: "Highest price" },
  { value: "title", label: "Title A-Z" }
];

export function EventFilters({
  filters,
  onChange,
  sortBy,
  onSortChange,
  resultCount,
  totalCount
}: EventFiltersProps) {
  return (
    <div
      className="grid gap-5 rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.82),rgba(10,17,30,0.96))] p-5 shadow-[0_22px_50px_rgba(0,0,0,0.22)] transition-[box-shadow,border-color,background-color] duration-300 ease-out hover:border-[rgba(88,116,255,0.18)] hover:shadow-[0_26px_56px_rgba(0,0,0,0.26)] md:grid-cols-[minmax(0,1.2fr)_220px]"
      role="search"
      aria-label="Event filters"
    >
      <div className="grid gap-3">
        <Input
          label="Search events"
          placeholder="Search by title, theme, city, or venue"
          value={filters.query || ""}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
        />
        <div className="flex flex-col gap-2 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            Searching the events currently visible in the catalog.
          </p>
          <p className="text-[var(--text-muted)]">
            {resultCount} of {totalCount} event{totalCount === 1 ? "" : "s"} shown
          </p>
        </div>
      </div>
      <div className="grid gap-2 self-end text-sm text-[var(--text-secondary)]">
        <label className="grid gap-2" htmlFor="event-sort">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Sort visible results
          </span>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] transition-colors duration-200"
              aria-hidden="true"
            />
            <select
              id="event-sort"
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as EventSortOption)}
              className="h-12 w-full rounded-[22px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.96),rgba(10,17,30,0.98))] pl-11 pr-4 text-sm text-[var(--text-primary)] outline-none transition-[border-color,box-shadow,background-color,transform] duration-200 ease-out hover:border-[rgba(88,116,255,0.24)] hover:bg-[linear-gradient(180deg,rgba(18,30,52,0.98),rgba(11,19,33,0.98))] focus-visible:border-[rgba(88,116,255,0.38)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </label>
      </div>
    </div>
  );
}
