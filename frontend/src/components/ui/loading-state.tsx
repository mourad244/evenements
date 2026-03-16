import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type LoadingStateProps = {
  label?: string;
  minHeightClassName?: string;
  variant?: "catalog" | "detail" | "dashboard" | "table" | "workspace" | "editor";
};

function LoadingLayout({
  variant
}: {
  variant: NonNullable<LoadingStateProps["variant"]>;
}) {
  if (variant === "catalog") {
    return (
      <div className="grid w-full gap-5">
        <div className="grid gap-3">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-10 w-full max-w-3xl" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>
        <div className="grid gap-4 rounded-[28px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)] p-4 md:grid-cols-[minmax(0,1.2fr)_220px]">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`catalog-card-${index}`}
              className="grid gap-4 rounded-[28px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)] p-4"
            >
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-8 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-11 w-36 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className="grid w-full gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="grid gap-0 overflow-hidden rounded-[32px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)]">
          <Skeleton className="h-72 w-full rounded-none" />
          <div className="grid gap-4 p-5 sm:p-6">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-5/6" />
            <Skeleton className="h-28 w-full" />
          </div>
        </div>
        <div className="grid gap-4 self-start rounded-[32px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)] p-5">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="grid w-full gap-5">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`summary-${index}`}
              className="grid gap-3 rounded-[28px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)] p-5"
            >
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
        <div className="grid gap-3 rounded-[32px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)] p-5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="overflow-hidden rounded-[32px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)]">
          <div className="grid gap-3 border-b border-[var(--line-soft)] p-5">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid gap-3 border-b border-[var(--line-soft)] p-4">
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid gap-3 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`row-${index}`} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "workspace") {
    return (
      <div className="grid w-full gap-5">
        <div className="grid gap-3 rounded-[32px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)] p-5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`workspace-summary-${index}`}
              className="grid gap-3 rounded-[28px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)] p-5"
            >
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 rounded-[32px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)] p-5">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={`workspace-item-${index}`} className="h-28 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "editor") {
    return (
      <div className="grid w-full gap-5">
        <div className="grid gap-4 rounded-[32px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)] p-5">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-14 w-full" />
        </div>
        <div className="grid gap-4 rounded-[32px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)] p-5">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-12 w-40 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid w-full gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={`dashboard-summary-${index}`}
            className="grid gap-3 rounded-[28px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)] p-5"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 rounded-[32px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)] p-5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="h-36 w-full" />
      </div>
      <div className="grid gap-4 rounded-[32px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.64)] p-5">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-72" />
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={`dashboard-row-${index}`} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}

export function LoadingState({
  label = "Loading...",
  minHeightClassName = "min-h-[240px]",
  variant = "dashboard"
}: LoadingStateProps) {
  return (
    <Card
      className={`grid ${minHeightClassName} gap-5 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.94),rgba(9,15,26,0.98))] shadow-[0_24px_56px_rgba(0,0,0,0.28)]`}
      role="status"
      aria-live="polite"
    >
      <LoadingLayout variant={variant} />
      <p className="max-w-xl text-sm leading-6 text-[var(--text-secondary)]">{label}</p>
    </Card>
  );
}
