import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type SectionPanelProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionPanel({
  eyebrow,
  title,
  description,
  action,
  children,
  className
}: SectionPanelProps) {
  const titleId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-section-title`;

  return (
    <Card
      role="region"
      aria-labelledby={titleId}
      className={
        className ||
        "grid gap-6 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.94),rgba(10,17,30,0.98))] shadow-[0_28px_60px_rgba(0,0,0,0.34)]"
      }
    >
      <div className="grid gap-5 border-b border-[var(--line-soft)] pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="grid gap-2">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
              {eyebrow}
            </p>
          ) : null}
          <div className="grid gap-1.5">
            <h2 id={titleId} className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              {title}
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
              {description}
            </p>
          </div>
        </div>
        {action ? (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
            {action}
          </div>
        ) : null}
      </div>
      {children}
    </Card>
  );
}
