import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type ErrorStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <Card
      className="relative overflow-hidden border-[rgba(251,113,133,0.2)] bg-[radial-gradient(circle_at_top_right,rgba(251,113,133,0.1),transparent_30%),linear-gradient(180deg,rgba(28,17,24,0.96),rgba(15,11,15,0.98))] shadow-[0_28px_64px_rgba(0,0,0,0.3)]"
      role="alert"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.16),transparent)]" />
      <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
        <div className="flex justify-center sm:justify-start">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-[22px] border border-[rgba(251,113,133,0.18)] bg-[radial-gradient(circle_at_top,rgba(251,113,133,0.22),rgba(30,18,24,0.94))] shadow-[0_18px_36px_rgba(59,18,28,0.24)]">
            <span className="h-5 w-5 rounded-full border border-[rgba(255,255,255,0.18)] bg-[linear-gradient(180deg,rgba(251,113,133,0.92),rgba(190,24,93,0.7))]" />
          </div>
        </div>
        <div className="grid gap-3 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--status-danger)]">
            Something needs attention
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
            {title}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
          {action ? (
            <div className="flex flex-col gap-3 pt-1.5 sm:flex-row sm:flex-wrap [&_a]:w-full sm:[&_a]:w-auto [&_button]:w-full sm:[&_button]:w-auto">
              {action}
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
