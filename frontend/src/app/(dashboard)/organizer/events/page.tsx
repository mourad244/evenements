"use client";

import Link from "next/link";
import { useState } from "react";

import { PageTitle } from "@/components/shared/page-title";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { useOrganizerEventsQuery } from "@/features/events/hooks/use-organizer-events-query";
import type {
  EventItem,
  EventStatus,
  OrganizerEventCounts,
  OrganizerEventsQueryFilters
} from "@/features/events/types/event.types";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format-date";

type DraftFilters = {
  status: EventStatus | "";
  theme: string;
  fromDate: string;
  toDate: string;
};

const INITIAL_FILTERS: DraftFilters = {
  status: "",
  theme: "",
  fromDate: "",
  toDate: ""
};

const DEFAULT_COUNTS: OrganizerEventCounts = {
  total: 0,
  draft: 0,
  published: 0,
  full: 0,
  closed: 0,
  archived: 0,
  cancelled: 0
};

const STATUS_OPTIONS: Array<{ value: DraftFilters["status"]; label: string }> = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "FULL", label: "Full" },
  { value: "CLOSED", label: "Closed" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "CANCELLED", label: "Cancelled" }
];

function sortEventsByDate(events: EventItem[]) {
  return [...events].sort((left, right) => Date.parse(left.startAt) - Date.parse(right.startAt));
}

function getOrganizerAttentionCue(event: EventItem) {
  if (event.status === "DRAFT") {
    return {
      title: "Needs attention now",
      description: "Complete the draft details before this event is ready to publish.",
      tone: "text-[var(--status-warning)]"
    };
  }

  if (event.status === "PUBLISHED") {
    return {
      title: "Live and ready to monitor",
      description: "Use the registrations view when you need the fastest participant-status check.",
      tone: "text-[var(--status-success)]"
    };
  }

  return {
    title: "Review-only state",
    description: "This event is outside the main draft-to-live workflow, so use it for context and record-keeping.",
    tone: "text-[var(--text-primary)]"
  };
}

function getCountTone(status: keyof OrganizerEventCounts) {
  if (status === "published") return "text-[var(--status-success)]";
  if (status === "draft" || status === "full") return "text-[var(--status-warning)]";
  if (status === "cancelled" || status === "closed" || status === "archived") {
    return "text-[var(--text-muted)]";
  }
  return "text-[var(--text-primary)]";
}

function hasActiveFilters(filters: DraftFilters) {
  return Boolean(filters.status || filters.theme.trim() || filters.fromDate || filters.toDate);
}

function toQueryFilters(filters: DraftFilters, page: number): OrganizerEventsQueryFilters {
  return {
    status: filters.status,
    theme: filters.theme.trim() || undefined,
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    page,
    pageSize: 6
  };
}

function OrganizerFilterPanel({
  draftFilters,
  onDraftChange,
  onApply,
  onReset,
  isDirty,
  resultCount,
  totalCount,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  canPrev,
  canNext
}: {
  draftFilters: DraftFilters;
  onDraftChange: (filters: DraftFilters) => void;
  onApply: () => void;
  onReset: () => void;
  isDirty: boolean;
  resultCount: number;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  return (
    <Card className="grid gap-5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_52px_rgba(0,0,0,0.24)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="grid gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary-strong)]">
            Organizer filters
          </p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Refine your workspace</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Filter by lifecycle state, theme, or date window. The list and summary cards stay scoped to your own events.
          </p>
        </div>
        {isDirty ? (
          <Button variant="ghost" onClick={onReset} className="w-full lg:w-auto">
            Reset filters
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-[var(--text-secondary)]">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Status
            </span>
            <select
              value={draftFilters.status}
              onChange={(event) =>
                onDraftChange({ ...draftFilters, status: event.target.value as DraftFilters["status"] })
              }
              className="h-12 rounded-[22px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.96),rgba(10,17,30,0.98))] px-4 text-sm text-[var(--text-primary)] outline-none transition focus-visible:border-[rgba(88,116,255,0.38)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Theme"
            placeholder="Search by theme"
            value={draftFilters.theme}
            onChange={(event) => onDraftChange({ ...draftFilters, theme: event.target.value })}
          />
          <Input
            label="From date"
            type="date"
            value={draftFilters.fromDate}
            onChange={(event) => onDraftChange({ ...draftFilters, fromDate: event.target.value })}
          />
          <Input
            label="To date"
            type="date"
            value={draftFilters.toDate}
            onChange={(event) => onDraftChange({ ...draftFilters, toDate: event.target.value })}
          />
        </div>

        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-[var(--line-soft)] bg-[rgba(12,20,35,0.74)] px-3 py-1.5 text-[var(--text-secondary)]">
              Showing <span className="font-semibold text-[var(--text-primary)]">{resultCount}</span> of{" "}
              <span className="font-semibold text-[var(--text-primary)]">{totalCount}</span>
            </span>
            <span className="rounded-full border border-[rgba(88,116,255,0.2)] bg-[rgba(88,116,255,0.12)] px-3 py-1.5 text-[var(--text-primary)]">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={onApply} className="w-full sm:w-auto">
              Apply filters
            </Button>
            <Button variant="ghost" onClick={onPrevPage} disabled={!canPrev} className="w-full sm:w-auto">
              Previous
            </Button>
            <Button variant="ghost" onClick={onNextPage} disabled={!canNext} className="w-full sm:w-auto">
              Next
            </Button>
          </div>

          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            {isDirty
              ? "Filters are ready to apply. Pagination stays scoped to the filtered organizer view."
              : "The backend summary counts remain scoped to your own events while you browse this workspace."}
          </p>
        </div>
      </div>
    </Card>
  );
}

function OrganizerEventSection({
  title,
  description,
  events,
  emptyTitle,
  emptyDescription
}: {
  title: string;
  description: string;
  events: EventItem[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <Card className="grid gap-5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.94),rgba(9,15,26,0.98))] shadow-[0_24px_56px_rgba(0,0,0,0.28)]">
      <div className="grid gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary-strong)]">
          Organizer section
        </p>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
      </div>

      {events.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} align="left" />
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex flex-col gap-4 rounded-[28px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.82),rgba(10,17,30,0.92))] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)] xl:flex-row xl:items-center xl:justify-between"
            >
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{event.title}</h3>
                  <StatusBadge status={event.status} />
                </div>
                <div className="grid gap-1 rounded-[22px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.68)] px-4 py-3">
                  <p className={`text-sm font-medium ${getOrganizerAttentionCue(event).tone}`}>
                    {getOrganizerAttentionCue(event).title}
                  </p>
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    {getOrganizerAttentionCue(event).description}
                  </p>
                </div>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">{event.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--text-muted)]">
                  <p>{formatDate(event.startAt)}</p>
                  <p>
                    {event.city} | {event.venue}
                  </p>
                  <p>{event.capacity} seats</p>
                </div>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap xl:justify-end">
                <Link href={`/organizer/events/${event.id}`} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">
                    {event.status === "DRAFT" ? "Continue draft" : "Open event"}
                  </Button>
                </Link>
                <Link
                  href={`/organizer/events/${event.id}/registrations`}
                  className="w-full sm:w-auto"
                >
                  <Button variant="ghost" className="w-full sm:w-auto">
                    Registrations
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function OrganizerEventsPage() {
  const [draftFilters, setDraftFilters] = useState<DraftFilters>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<DraftFilters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);

  const queryFilters = toQueryFilters(appliedFilters, page);
  const { data, isLoading, isError, error } = useOrganizerEventsQuery(queryFilters);
  const sortedEvents = sortEventsByDate(data?.items || []);
  const counts = data?.counts || DEFAULT_COUNTS;
  const total = data?.total || 0;
  const currentPage = data?.page || page;
  const pageSize = data?.pageSize || 6;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const isDirty = hasActiveFilters(draftFilters);
  const draftEvents = sortedEvents.filter((event) => event.status === "DRAFT");
  const publishedEvents = sortedEvents.filter((event) => event.status === "PUBLISHED");
  const otherEvents = sortedEvents.filter(
    (event) => event.status !== "DRAFT" && event.status !== "PUBLISHED"
  );
  const attentionCount = counts.total - counts.published;

  function applyFilters() {
    setAppliedFilters({ ...draftFilters });
    setPage(1);
  }

  function resetFilters() {
    setDraftFilters({ ...INITIAL_FILTERS });
    setAppliedFilters({ ...INITIAL_FILTERS });
    setPage(1);
  }

  return (
    <div className="grid gap-10">
      <PageTitle
        eyebrow="Organizer"
        title="Organizer events"
        description="Manage drafts, monitor published events, and move quickly between the organizer tasks that matter most."
      />
      <Card className="flex flex-col gap-4 border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.12),transparent_28%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_28px_64px_rgba(14,24,54,0.3)] sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
            Organizer workspace
          </p>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Event workspace</h2>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            Keep drafts and published events organized in one place, with clear next steps for each stage.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="rounded-full border border-[rgba(243,154,99,0.18)] bg-[rgba(243,154,99,0.1)] px-3 py-1.5 text-sm text-[var(--text-primary)]">
              Needs attention: {attentionCount}
            </span>
            <span className="rounded-full border border-[rgba(88,116,255,0.2)] bg-[rgba(88,116,255,0.12)] px-3 py-1.5 text-sm text-[var(--text-primary)]">
              Live now: {counts.published}
            </span>
            <span className="rounded-full border border-[var(--line-soft)] bg-[rgba(12,20,35,0.74)] px-3 py-1.5 text-sm text-[var(--text-primary)]">
              Drafts: {counts.draft}
            </span>
            <span className="rounded-full border border-[var(--line-soft)] bg-[rgba(12,20,35,0.74)] px-3 py-1.5 text-sm text-[var(--text-primary)]">
              Total: {counts.total}
            </span>
          </div>
        </div>
        <Link href={ROUTES.organizerNewEvent} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Create event</Button>
        </Link>
      </Card>

      <OrganizerFilterPanel
        draftFilters={draftFilters}
        onDraftChange={setDraftFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        isDirty={isDirty}
        resultCount={sortedEvents.length}
        totalCount={total}
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={() => setPage((current) => Math.max(1, current - 1))}
        onNextPage={() => setPage((current) => Math.min(totalPages, current + 1))}
        canPrev={page > 1}
        canNext={page < totalPages}
      />

      {isLoading ? (
        <LoadingState label="Loading organizer events..." variant="workspace" />
      ) : isError ? (
        <ErrorState title="Could not load organizer events" description={error.message} />
      ) : total === 0 ? (
        <EmptyState
          title={isDirty ? "No matching organizer events" : "No organizer events yet"}
          description={
            isDirty
              ? "Try clearing one of the filters or broaden the date window to reveal more of your organizer workspace."
              : "Create your first event draft to begin publishing and managing registrations."
          }
          action={
            <Link href={ROUTES.organizerNewEvent} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Create event</Button>
            </Link>
          }
          align="left"
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="grid gap-2.5 border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.12),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Draft events</p>
              <h2 className={`text-3xl font-semibold tracking-tight ${getCountTone("draft")}`}>{counts.draft}</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Drafts that still need refinement or publishing.
              </p>
            </Card>
            <Card className="grid gap-2.5 border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.1),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Published events</p>
              <h2 className={`text-3xl font-semibold tracking-tight ${getCountTone("published")}`}>{counts.published}</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Live events that participants can already discover.
              </p>
            </Card>
            <Card className="grid gap-2.5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Needs attention</p>
              <h2 className={`text-3xl font-semibold tracking-tight ${getCountTone("draft")}`}>{attentionCount}</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Drafts and other non-live states that still need organizer review.
              </p>
            </Card>
          </div>

          <OrganizerEventSection
            title="Drafts to finish"
            description="These events still need organizer attention before they are ready to publish."
            events={draftEvents}
            emptyTitle="No drafts right now"
            emptyDescription="Create a new draft whenever you are ready to plan your next event."
          />

          <OrganizerEventSection
            title="Published events"
            description="These events are already live, so this is the fastest place to review details and registrations."
            events={publishedEvents}
            emptyTitle="No published events yet"
            emptyDescription="Published events will appear here once one of your drafts goes live."
          />

          {otherEvents.length > 0 ? (
            <OrganizerEventSection
              title="Other event states"
              description="Any events outside the main draft and published workflow will appear here."
              events={otherEvents}
              emptyTitle=""
              emptyDescription=""
            />
          ) : null}
        </>
      )}
    </div>
  );
}
