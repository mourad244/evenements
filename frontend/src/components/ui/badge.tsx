import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

type BadgeProps = PropsWithChildren<{ className?: string }>;

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[rgba(88,116,255,0.24)] bg-[rgba(88,116,255,0.12)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary-strong)] shadow-[0_10px_22px_rgba(17,28,66,0.18)]",
        className
      )}
    >
      {children}
    </span>
  );
}
