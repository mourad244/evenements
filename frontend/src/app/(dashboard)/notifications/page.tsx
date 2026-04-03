"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { RoleGuard } from "@/components/guards/role-guard";
import { PageTitle } from "@/components/shared/page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Select } from "@/components/ui/select";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useMarkNotificationReadMutation } from "@/features/notifications/hooks/use-mark-notification-read-mutation";
import { useNotificationsQuery } from "@/features/notifications/hooks/use-notifications-query";
import type { NotificationItem } from "@/features/notifications/types/notification.types";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format-date";
import { normalizePositiveInt } from "@/lib/utils/normalize-positive-int";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function formatNotificationType(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
    .join(" ");
}

function getPageSummary(notifications: NotificationItem[]) {
  const unread = notifications.filter((item) => !item.isRead).length;
  const latest = notifications
    .map((item) => item.createdAt)
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0];

  return { unread, latest };
}

export default function NotificationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: user } = useCurrentUser();

  const page = normalizePositiveInt(searchParams.get("page"), 1);
  const pageSize = PAGE_SIZE_OPTIONS.includes(
    normalizePositiveInt(searchParams.get("pageSize"), 10)
  )
    ? normalizePositiveInt(searchParams.get("pageSize"), 10)
    : 10;

  const { data, isLoading, isError, error, isFetching } = useNotificationsQuery({
    page,
    pageSize
  });
  const mutation = useMarkNotificationReadMutation();

  function updateSearchParams(partial: Partial<Record<"page" | "pageSize", string>>) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(partial)) {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false
    });
  }

  const pagination = data?.pagination || {
    page,
    pageSize,
    total: 0,
    totalPages: 1
  };
  const notifications = data?.items || [];
  const summary = getPageSummary(notifications);
  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const end = pagination.total === 0 ? 0 : Math.min(pagination.total, pagination.page * pagination.pageSize);

  return (
    <RoleGuard user={user} allowedRoles={["PARTICIPANT", "ORGANIZER", "ADMIN"]}>
      <div className="grid gap-10">
        <PageTitle
          eyebrow="Workspace"
          title="Notifications"
          description="Keep a clean record of what changed across your events, registrations, and tickets so you can act on updates quickly."
        />

        <Card className="grid gap-5 border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.14),transparent_28%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_28px_64px_rgba(14,24,54,0.3)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
                Notification center
              </p>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                Track updates without losing context
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
                Use this list to confirm what changed, mark items as read, and keep your workspace focused.
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

        {isLoading ? (
          <LoadingState label="Loading notifications..." variant="workspace" />
        ) : isError ? (
          <ErrorState title="Could not load notifications" description={error.message} />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            description="Updates will show up here when your registrations move, events publish, or tickets become available."
            action={
              <Link href={ROUTES.events}>
                <Button>Browse events</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="grid gap-2.5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Total notifications
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {pagination.total}
                </h2>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  All updates currently available for your account.
                </p>
              </Card>
              <Card className="grid gap-2.5 border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.12),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Unread on this page
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {summary.unread}
                </h2>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  Mark each update as read once it has been reviewed.
                </p>
              </Card>
              <Card className="grid gap-2.5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.26)]">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Latest update
                </p>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                  {summary.latest ? formatDate(summary.latest) : "No updates yet"}
                </h2>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">
                  This is the most recent activity in the current view.
                </p>
              </Card>
            </div>

            <Card className="flex flex-col gap-3 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.94),rgba(9,15,26,0.98))] sm:flex-row sm:items-center sm:justify-between">
              <div className="grid gap-1">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Notification list</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Showing {start}–{end} of {pagination.total} update
                  {pagination.total === 1 ? "" : "s"}.
                </p>
              </div>
              <div className="grid gap-1 text-sm text-[var(--text-muted)] sm:text-right">
                <p>
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                {isFetching ? <p>Refreshing notifications...</p> : <p>Stay current with your latest updates.</p>}
              </div>
            </Card>

            <div className="grid gap-4" role="list">
              {mutation.isError ? (
                <p
                  role="alert"
                  className="rounded-[22px] border border-[rgba(251,113,133,0.24)] bg-[rgba(127,29,29,0.26)] px-4 py-3 text-sm text-[var(--status-danger)]"
                >
                  {mutation.error.message}
                </p>
              ) : null}
              {notifications.map((notification) => {
                const isUpdating =
                  mutation.isPending && mutation.variables === notification.id;
                const statusTone = notification.isRead
                  ? "border-[var(--line-soft)] bg-[rgba(12,20,35,0.72)]"
                  : "border-[rgba(88,116,255,0.35)] bg-[linear-gradient(180deg,rgba(18,28,46,0.94),rgba(9,15,26,0.98))]";

                return (
                  <Card
                    key={notification.id}
                    role="listitem"
                    className={`grid gap-4 border ${statusTone} shadow-[0_20px_44px_rgba(0,0,0,0.24)]`}
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="grid gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="border-[rgba(88,116,255,0.3)] bg-[rgba(88,116,255,0.16)] text-[var(--accent-primary-strong)]">
                            {formatNotificationType(notification.type)}
                          </Badge>
                          {notification.isRead ? (
                            <Badge className="border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.08)] text-[var(--text-muted)]">
                              Read
                            </Badge>
                          ) : (
                            <Badge className="border-[rgba(243,154,99,0.28)] bg-[rgba(243,154,99,0.18)] text-[var(--accent-warm)]">
                              Unread
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                          {notification.title}
                        </h3>
                        <p className="text-sm leading-6 text-[var(--text-secondary)]">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                        <Button
                          variant="ghost"
                          onClick={() => mutation.mutate(notification.id)}
                          disabled={notification.isRead || isUpdating}
                        >
                          {notification.isRead
                            ? "Already read"
                            : isUpdating
                              ? "Marking..."
                              : "Mark as read"}
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                      <span>Created {formatDate(notification.createdAt)}</span>
                      {notification.readAt ? (
                        <span>Read {formatDate(notification.readAt)}</span>
                      ) : null}
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card className="flex flex-col gap-4 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.94),rgba(9,15,26,0.98))] sm:flex-row sm:items-center sm:justify-between">
              <div className="grid gap-1">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Pagination</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Showing {start}–{end} of {pagination.total} notifications.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Select
                  label="Page size"
                  value={String(pageSize)}
                  onChange={(event) =>
                    updateSearchParams({ pageSize: event.target.value, page: "1" })
                  }
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option} per page
                    </option>
                  ))}
                </Select>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={() =>
                      updateSearchParams({
                        page: String(Math.max(1, pagination.page - 1))
                      })
                    }
                    disabled={pagination.page <= 1}
                    variant="ghost"
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
              </div>
            </Card>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
