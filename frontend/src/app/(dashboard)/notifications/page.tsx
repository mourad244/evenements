"use client";

import { useEffect, useMemo, useState } from "react";

import { PageTitle } from "@/components/shared/page-title";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useNotificationsQuery } from "@/features/notifications/hooks/use-notifications-query";
import { useMarkNotificationReadMutation } from "@/features/notifications/hooks/use-mark-notification-read-mutation";
import { formatDate } from "@/lib/utils/format-date";

function formatType(type: string) {
  return type.replace(/_/g, " ").toLowerCase();
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const { data, isLoading, isError, error } = useNotificationsQuery({
    page,
    pageSize
  });
  const markReadMutation = useMarkNotificationReadMutation();
  const notifications = data?.items ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? page;
  const currentPageSize = data?.pageSize ?? pageSize;
  const totalPages = Math.max(1, Math.ceil(total / currentPageSize));
  const rangeStart =
    total === 0 ? 0 : (currentPage - 1) * currentPageSize + 1;
  const rangeEnd =
    total === 0 ? 0 : Math.min(currentPage * currentPageSize, total);
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  useEffect(() => {
    if (!isLoading && page > totalPages) {
      setPage(totalPages);
    }
  }, [isLoading, page, totalPages]);

  return (
    <div className="grid gap-10">
      <PageTitle
        eyebrow="Notifications"
        title="Your notifications"
        description="Keep up with confirmations, promotions, and event updates without leaving the dashboard workspace."
      />

      {isLoading ? (
        <LoadingState label="Loading notifications..." variant="table" />
      ) : isError ? (
        <ErrorState
          title="Could not load notifications"
          description={
            error instanceof Error
              ? error.message
              : "The notifications service is unavailable right now."
          }
        />
      ) : total === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="When registrations or events change state, they will appear here."
          align="left"
        />
      ) : (
        <div className="grid gap-4">
          <Card className="flex flex-col gap-3 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.94),rgba(9,15,26,0.98))] sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--accent-primary-strong)]">
                Notification center
              </p>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {total} update{total === 1 ? "" : "s"} on record
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Unread in view: {unreadCount}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Showing {rangeStart}-{rangeEnd} of {total}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-xs text-[var(--text-muted)]">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>

          {markReadMutation.error ? (
            <p
              role="alert"
              className="rounded-[22px] border border-[rgba(251,113,133,0.24)] bg-[rgba(127,29,29,0.26)] px-4 py-3 text-sm text-[var(--status-danger)]"
            >
              {markReadMutation.error.message}
            </p>
          ) : null}

          <div className="grid gap-4">
            {notifications.map((item) => {
              const isUnread = !item.isRead;
              const isMarking =
                markReadMutation.isPending &&
                markReadMutation.variables === item.notificationId;

              return (
                <Card
                  key={item.id}
                  className="grid gap-4 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_52px_rgba(0,0,0,0.26)] lg:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div className="grid gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          isUnread
                            ? "border-[rgba(88,116,255,0.4)] bg-[rgba(88,116,255,0.14)] text-[var(--accent-primary-strong)]"
                            : "border-[var(--line-soft)] bg-[rgba(16,26,45,0.8)] text-[var(--text-secondary)]"
                        }`}
                      >
                        {isUnread ? "Unread" : "Read"}
                      </span>
                      <span className="rounded-full border border-[var(--line-soft)] bg-[rgba(12,20,35,0.7)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        {formatType(item.type)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                      {item.title}
                    </h3>
                    {item.message ? (
                      <p className="text-sm leading-6 text-[var(--text-secondary)]">
                        {item.message}
                      </p>
                    ) : null}
                    <p className="text-xs text-[var(--text-muted)]">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-end">
                    {isUnread ? (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          markReadMutation.mutate(item.notificationId)
                        }
                        disabled={isMarking}
                        className="w-full sm:w-auto"
                      >
                        {isMarking ? "Marking..." : "Mark as read"}
                      </Button>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)]">
                        Read {item.readAt ? formatDate(item.readAt) : "recently"}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
