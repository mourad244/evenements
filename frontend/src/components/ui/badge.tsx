import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

type BadgeProps = PropsWithChildren<{ className?: string }>;

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700",
        className
      )}
    >
      {children}
    </span>
  );
}
