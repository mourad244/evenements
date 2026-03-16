import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  align?: "center" | "left";
};

export function EmptyState({
  title,
  description,
  action,
  align = "center"
}: EmptyStateProps) {
  const isLeftAligned = align === "left";

  return (
    <Card
      className={`relative overflow-hidden border-[var(--line-soft)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.14),transparent_32%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_28px_64px_rgba(0,0,0,0.3)] ${isLeftAligned ? "text-left" : "text-center"}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)]" />
      <div className={`grid gap-5 ${isLeftAligned ? "justify-items-start" : "justify-items-center"}`}>
        <div className="relative flex h-14 w-14 items-center justify-center rounded-[22px] border border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top,rgba(88,116,255,0.24),rgba(15,24,40,0.94))] shadow-[0_18px_34px_rgba(17,28,66,0.26)]">
          <span className="h-5 w-5 rounded-full border border-[rgba(255,255,255,0.24)] bg-[linear-gradient(180deg,rgba(88,116,255,0.88),rgba(65,93,255,0.64))]" />
        </div>
        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
            Empty view
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
            {title}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
        </div>
        {action ? (
          <div className="flex w-full flex-col gap-3 pt-1.5 sm:w-auto sm:flex-row sm:flex-wrap [&_a]:w-full sm:[&_a]:w-auto [&_button]:w-full sm:[&_button]:w-auto">
            {action}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
