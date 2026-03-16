"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { RoleGuard } from "@/components/guards/role-guard";
import { PageTitle } from "@/components/shared/page-title";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { RegistrationList } from "@/features/registrations/components/registration-list";
import { useMyRegistrationsQuery } from "@/features/registrations/hooks/use-my-registrations-query";
import type {
  ParticipantHistoryQuery,
  RegistrationItem,
  RegistrationStatusFilter
} from "@/features/registrations/types/registration.types";
import { formatDate } from "@/lib/utils/format-date";

const STATUS_OPTIONS: RegistrationStatusFilter[] = [
  "ALL",
  "CONFIRMED",
  "WAITLISTED",
  "CANCELLED",
  "REJECTED"
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function normalizePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

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

  return (
    <RoleGuard user={user} allowedRoles={["PARTICIPANT"]}>
      <div className="grid gap-8">
        <PageTitle
          eyebrow="Participant"
          title="My registrations"
          description="Review your participation history, ticket readiness, and registration progress in one place."
        />

        <Card className="grid gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-2">
              <h2 className="text-xl font-semibold text-ink">Filters and pagination</h2>
              <p className="text-sm text-slate-600">
                Narrow your history by registration status and control how many results are shown per page.
              </p>
            </div>
            {isFetching && !isLoading ? (
              <p className="text-sm text-slate-500">Refreshing registrations...</p>
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
                  className={`min-h-11 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    option === status
                      ? "bg-brand-600 text-white"
                      : "bg-white/70 text-ink ring-1 ring-line hover:bg-white"
                  }`}
                >
                  {option === "ALL" ? "All statuses" : option}
                </button>
              ))}
            </fieldset>

            <label
              className="grid gap-2 text-sm text-slate-600 sm:max-w-[220px] lg:max-w-none"
              htmlFor="registrations-page-size"
            >
              Page size
              <select
                id="registrations-page-size"
                value={String(pageSize)}
                onChange={(event) =>
                  updateSearchParams({ pageSize: event.target.value, page: "1" })
                }
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none focus-visible:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-100"
              >
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option} per page
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Card>

        {isLoading ? (
          <LoadingState label="Loading registrations..." />
        ) : isError ? (
          <ErrorState title="Could not load registrations" description={error.message} />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="grid gap-2.5">
                <p className="text-sm text-slate-500">Confirmed on this page</p>
                <h2 className="text-2xl font-semibold text-ink">{pageSummary.confirmed}</h2>
                <p className="text-sm text-slate-600">
                  Registrations that already hold a confirmed place.
                </p>
              </Card>
              <Card className="grid gap-2.5">
                <p className="text-sm text-slate-500">Waitlisted on this page</p>
                <h2 className="text-2xl font-semibold text-ink">{pageSummary.waitlisted}</h2>
                <p className="text-sm text-slate-600">
                  Registrations still waiting for movement from the organizer.
                </p>
              </Card>
              <Card className="grid gap-2.5">
                <p className="text-sm text-slate-500">Ticket-ready on this page</p>
                <h2 className="text-2xl font-semibold text-ink">{pageSummary.ticketReady}</h2>
                <p className="text-sm text-slate-600">
                  Confirmed registrations that already expose ticket details.
                </p>
              </Card>
              <Card className="grid gap-2.5">
                <p className="text-sm text-slate-500">Latest update on this page</p>
                <h2 className="text-xl font-semibold text-ink">
                  {pageSummary.latestUpdate ? formatDate(pageSummary.latestUpdate) : "No updates yet"}
                </h2>
                <p className="text-sm text-slate-600">
                  The most recent registration change visible in your current results.
                </p>
              </Card>
            </div>

            <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid gap-1">
                <h2 className="text-xl font-semibold text-ink">Participant history</h2>
                <p className="text-sm text-slate-600">
                  {pagination.total} registration{pagination.total === 1 ? "" : "s"} found
                  {status !== "ALL" ? ` with status ${status}` : ""}.
                </p>
              </div>
              <p className="text-sm text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>
            </Card>

            <RegistrationList registrations={data?.items || []} />

            <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid gap-1">
                <h2 className="text-lg font-semibold text-ink">Pagination</h2>
                <p className="text-sm text-slate-600">
                  Showing up to {pagination.pageSize} registrations per page.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
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
                <Button
                  variant="ghost"
                  onClick={() => updateSearchParams({ page: String(Math.max(1, pagination.page - 1)) })}
                  disabled={pagination.page <= 1}
                  className="w-full sm:w-auto"
                >
                  Previous
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
