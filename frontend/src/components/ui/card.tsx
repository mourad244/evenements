import type { HTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

type CardProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-soft backdrop-blur sm:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
