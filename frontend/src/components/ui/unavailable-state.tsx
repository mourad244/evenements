import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type UnavailableStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function UnavailableState({
  title,
  description,
  action
}: UnavailableStateProps) {
  return (
    <Card className="relative overflow-hidden border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.12),transparent_30%),linear-gradient(180deg,rgba(26,20,18,0.96),rgba(11,16,28,0.98))] text-center shadow-[0_28px_64px_rgba(0,0,0,0.32)] sm:text-left">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)]" />
      <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
        <div className="flex justify-center sm:justify-start">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-[22px] border border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top,rgba(243,154,99,0.22),rgba(28,22,18,0.94))] shadow-[0_18px_36px_rgba(48,25,10,0.24)]">
            <span className="h-5 w-5 rounded-full border border-[rgba(255,255,255,0.2)] bg-[linear-gradient(180deg,rgba(243,154,99,0.92),rgba(189,97,51,0.72))]" />
          </div>
        </div>
        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-warm)]">
            Currently unavailable
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
