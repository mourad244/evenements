import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type DataTableShellProps = {
  title: string;
  description: string;
  meta?: ReactNode;
  tableMinWidthClassName?: string;
  caption: string;
  children: ReactNode;
};

export function DataTableShell({
  title,
  description,
  meta,
  tableMinWidthClassName = "min-w-[760px]",
  caption,
  children
}: DataTableShellProps) {
  const shellId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const titleId = `${shellId}-table-title`;
  const hintId = `${shellId}-table-hint`;

  return (
    <Card
      role="region"
      aria-labelledby={titleId}
      className="overflow-hidden border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.94),rgba(9,15,26,0.98))] p-0 shadow-[0_24px_56px_rgba(0,0,0,0.3)]"
    >
      <div className="grid gap-3 border-b border-[var(--line-soft)] px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid gap-1">
            <h2 id={titleId} className="text-lg font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">{description}</p>
          </div>
          {meta ? <div className="grid gap-1 text-sm text-[var(--text-muted)] sm:text-right">{meta}</div> : null}
        </div>
      </div>
      <div
        id={hintId}
        className="border-b border-[var(--line-soft)] bg-[rgba(12,20,35,0.72)] px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)] sm:px-6"
      >
        Scroll horizontally on smaller screens to review every column.
      </div>
      <div
        tabIndex={0}
        role="group"
        aria-label={`${title} table`}
        aria-describedby={hintId}
        className="-mx-1 overflow-x-auto px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-inset"
      >
        <table className={`${tableMinWidthClassName} text-left text-sm`}>
          <caption className="sr-only">{caption}</caption>
          {children}
        </table>
      </div>
    </Card>
  );
}
