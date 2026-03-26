import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

type CardProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-surface)] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.92),rgba(11,18,32,0.96))] p-5 text-[var(--text-primary)] shadow-[var(--shadow-surface)] backdrop-blur-xl transition-[box-shadow,border-color,background-color] duration-300 ease-out motion-reduce:transition-none sm:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
