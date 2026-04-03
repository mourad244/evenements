"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { RoleGuard } from "@/components/guards/role-guard";
import { PageTitle } from "@/components/shared/page-title";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { RegistrationList } from "@/features/registrations/components/registration-list";
import { useMyRegistrationsQuery } from "@/features/registrations/hooks/use-my-registrations-query";
import type {
  ParticipantHistoryQuery,
  RegistrationItem,
  RegistrationStatusFilter
} from "@/features/registrations/types/registration.types";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format-date";
import { normalizePositiveInt } from "@/lib/utils/normalize-positive-int";

const STATUS_OPTIONS: RegistrationStatusFilter[] = [
  "ALL",
  "CONFIRMED",
  "WAITLISTED",
  "CANCELLED",
  "REJECTED"
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function normalizeStatus(value: string | null): RegistrationStatusFilter {
  const candidate = String(value || "ALL").toUpperCase() as RegistrationStatusFilter;
  return STATUS_OPTIONS.includes(candidate) ? candidate : "ALL";
}

function getPageSummary(registrations: RegistrationItem[]) {
  const confirmed = registrations.filter((registration) => registration.status === "CONFIRMED").length;
  const waitlisted = registrations.filter((registration) => registration.status === "WAITLISTED").length;
  const ticketReady = registrations.filter(
    (registration) => registration.canDownloadTicket && registration.ticketId
  ).length;
  const latestUpdate = registrations
    .map((registration) => registration.updatedAt)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0];

  return {
    confirmed,
    waitlisted,
    ticketReady,
    latestUpdate
  };
}

function getHistoryGuidance(
  registrations: RegistrationItem[],
  status: RegistrationStatusFilter,
  totalVisible: number
) {
  const active = registrations.filter(
    (registration) =>
      registration.status === "CONFIRMED" || registration.status === "WAITLISTED"
  ).length;
  const ticketReady = registrations.filter(
    (registration) => registration.canDownloadTicket && registration.ticketId
  ).length;

  if (totalVisible === 0) {
    return {
      title: "Your history is ready whenever you are",
      description:
        "Once you register for an event, this page becomes your clearest record for participation status, waitlist movement, and ticket readiness."
    };
  }

  if (status === "WAITLISTED") {
    return {
      title: "This view is focused on waitlist movement",
      description:
        "Use it to monitor waitlist position changes, then return to the dashboard when you want a broader participant summary."
    };
  }

  if (status === "CONFIRMED") {
    return {
      title: ticketReady > 0 ? "Confirmed places with ticket progress" : "Confirmed places that still need attention",
      description:
        ticketReady > 0
          ? "This filtered view keeps confirmed places and visible ticket readiness together in one place."
          : "Your confirmed places are here, even if ticket details are still being prepared."
    };
  }

  if (active > 0) {
    return {
      title: "Your active participation is visible here",
      description:
        "Use this page for the detailed record, then return to the dashboard when you want the fastest next-step guidance."
    };
  }

  return {
    title: "Your history keeps the full story",
    description:
      "This page is best for understanding what changed, what is still active, and which registrations no longer need attention."
  };
}

export default function MyRegistrationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: user } = useCurrentUser();

  const status = normalizeStatus(searchParams.get("status"));
  const page = normalizePositiveInt(searchParams.get("page"), 1);
  const pageSize = PAGE_SIZE_OPTIONS.includes(
    normalizePositiveInt(searchParams.get("pageSize"), 20)
  )
    ? normalizePositiveInt(searchParams.get("pageSize"), 20)
    : 20;

  const query: ParticipantHistoryQuery = {
    status,
    page,
    pageSize
  };

  const { data, isLoading, isError, error, isFetching } = useMyRegistrationsQuery(query);

  function updateSearchParams(partial: Partial<Record<"status" | "page" | "pageSize", string>>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(partial)) {
      if (!value || value === "ALL") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  const pagination = data?.pagination || {
    page,
    pageSize,
    total: 0,
    totalPages: 1
  };
  const pageSummary = getPageSummary(data?.items || []);
  const historyGuidance = getHistoryGuidance(data?.items || [], status, pagination.total);

  return (
    <RoleGuard user={user} allowedRoles={["PARTICIPANT"]}>
      <div className="grid gap-10">
        <PageTitle
          eyebrow="Participant"
          title="My registrations"
          description="Review your participation history, understand what each registration means, and keep ticket readiness in view from one trusted place."
        />

        <Card className="grid gap-5 border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.14),transparent_28%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_28px_64px_rgba(14,24,54,0.3)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
                Participant guidance
              </p>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">{historyGuidance.title}</h2>
              <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                {historyGuidance.description}
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              <Link href={ROUTES.dashboard} className="w-full sm:w-auto">
                <Button variant="ghost" className="w-full sm:w-auto">
                  Open dashboard
                </Button>
              </Link>
              <Link href={ROUTES.events} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">Browse events</Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="grid gap-5 border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.14),transparent_28%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_28px_64px_rgba(14,24,54,0.3)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
                History controls
              </p>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Filters and pagination</h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Narrow your history by registration status and control how many results are shown per page.
              </p>
            </div>
            {isFetching && !isLoading ? (
              <p className="text-sm text-[var(--text-muted)]">Refreshing registrations...</p>
            ) : null}
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <fieldset className="flex flex-wrap gap-2">
              <legend className="sr-only">Filter registrations by status</legend>
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => updateSearchParams({ status: option, page: "1" })}
                  aria-pressed={option === status}
                  className={`min-h-11 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    option === status
                      ? "border-[rgba(88,116,255,0.42)] bg-[linear-gradient(135deg,rgba(88,116,255,0.28),rgba(65,93,255,0.12))] text-[var(--text-primary)] shadow-[0_14px_28px_rgba(65,93,255,0.18)]"
                      : "border-[var(--line-soft)] bg-[rgba(16,26,45,0.82)] text-[var(--text-secondary)] hover:bg-[rgba(22,36,58,0.92)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {option === "ALL" ? "All statuses" : option.charAt(0) + option.slice(1).toLowerCase()}
                </button>
              ))}
            </fieldset>

            <Select
              label="Page size"
              value={String(pageSize)}
              onChange={(event) =>
                updateSearchParams({ pageSize: event.target.value, page: "1" })
              }
              className="sm:max-w-[220px] lg:max-w-none"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} per page
                </option>
              ))}
            </Select>
          </div>
        </Card>

        {isLoading ? (
          <LoadingState label="Loading registrations..." variant="table" />
        ) : isError ? (
          <ErrorState title="Could not load registrations" description={error.message} />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="grid gap-2.5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Confirmed on this page</p>
                <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{pageSummary.confirmed}</h2>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Registrations that already hold a confirmed place.
                </p>
              </Card>
              <Card className="grid gap-2.5 border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.12),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Waitlisted on this page</p>
                <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{pageSummary.waitlisted}</h2>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Registrations still waiting for movement from the organizer.
                </p>
              </Card>
              <Card className="grid gap-2.5 border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.12),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Ticket-ready on this page</p>
                <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{pageSummary.ticketReady}</h2>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Confirmed registrations that already expose ticket details.
                </p>
              </Card>
              <Card className="grid gap-2.5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">Latest update on this page</p>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  {pageSummary.latestUpdate ? formatDate(pageSummary.latestUpdate) : "No updates yet"}
                </h2>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  The most recent registration change visible in your current results.
                </p>
              </Card>
            </div>

            <Card className="flex flex-col gap-3 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.94),rgba(9,15,26,0.98))] sm:flex-row sm:items-center sm:justify-between">
              <div className="grid gap-1">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Participant history</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {pagination.total} registration{pagination.total === 1 ? "" : "s"} found
                  {status !== "ALL" ? ` with status ${status}` : ""}.
                </p>
              </div>
              <div className="grid gap-1 text-sm text-[var(--text-muted)] sm:text-right">
                <p>
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <p>
                  Use the dashboard for next-step guidance, then return here for the full record.
                </p>
              </div>
            </Card>

            <RegistrationList registrations={data?.items || []} />

            <Card className="flex flex-col gap-4 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.94),rgba(9,15,26,0.98))] sm:flex-row sm:items-center sm:justify-between">
              <div className="grid gap-1">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Pagination</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Showing up to {pagination.pageSize} registrations per page.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="ghost"
                  onClick={() => updateSearchParams({ page: String(Math.max(1, pagination.page - 1)) })}
                  disabled={pagination.page <= 1}
                  className="w-full sm:w-auto"
                >
                  Previous
                </Button>
                <Button
                  onClick={() =>
                    updateSearchParams({
                      page: String(Math.min(pagination.totalPages, pagination.page + 1))
                    })
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="w-full sm:w-auto"
                >
                  Next
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
