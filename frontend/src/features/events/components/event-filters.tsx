"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { EventFilters } from "../types/event.types";

type EventSortOption = "soonest" | "latest" | "price-low" | "price-high" | "title";

type EventFiltersProps = {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
  sortBy: EventSortOption;
  onSortChange: (value: EventSortOption) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
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
  onReset,
  hasActiveFilters,
  resultCount,
  totalCount
}: EventFiltersProps) {
  const query = (filters.query || "").trim();

  return (
    <div
      className="grid gap-5 rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.82),rgba(10,17,30,0.96))] p-5 shadow-[0_22px_50px_rgba(0,0,0,0.22)] transition-[box-shadow,border-color,background-color] duration-300 ease-out hover:border-[rgba(88,116,255,0.18)] hover:shadow-[0_26px_56px_rgba(0,0,0,0.26)]"
      role="search"
      aria-label="Event filters"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="grid gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary-strong)]">
            Discovery controls
          </p>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Refine the visible catalog</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Search and sort the events already loaded on this page to surface the best match faster.
          </p>
        </div>
        {hasActiveFilters ? (
          <Button variant="ghost" onClick={onReset} className="w-full lg:w-auto">
            Reset filters
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_240px]">
        <div className="grid gap-3">
          <Input
            label="Search visible events"
            placeholder="Search by title, description, theme, city, or venue"
            value={filters.query || ""}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
          />
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-[var(--line-soft)] bg-[rgba(12,20,35,0.74)] px-3 py-1.5 text-[var(--text-secondary)]">
              {resultCount} of {totalCount} visible event{totalCount === 1 ? "" : "s"}
            </span>
            {query ? (
              <span className="rounded-full border border-[rgba(88,116,255,0.22)] bg-[rgba(88,116,255,0.12)] px-3 py-1.5 text-[var(--text-primary)]">
                Search: &quot;{query}&quot;
              </span>
            ) : null}
            <span className="rounded-full border border-[rgba(243,154,99,0.18)] bg-[rgba(243,154,99,0.1)] px-3 py-1.5 text-[var(--text-primary)]">
              Sort: {SORT_OPTIONS.find((option) => option.value === sortBy)?.label}
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            Search and sort apply only to the events currently visible in this catalog view.
          </p>
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
    </div>
  );
}
