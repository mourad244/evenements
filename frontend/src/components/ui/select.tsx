import { useId, type SelectHTMLAttributes, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  children: ReactNode;
};

export function Select({ className, label, error, id, children, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <label className="grid gap-2.5 text-sm text-[var(--text-secondary)]" htmlFor={selectId}>
      {label ? (
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          {label}
        </span>
      ) : null}
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={errorId}
          className={cn(
            "h-12 w-full appearance-none rounded-[22px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.96),rgba(10,17,30,0.98))] px-4 pr-10 text-sm text-[var(--text-primary)] outline-none ring-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition placeholder:text-[var(--text-muted)] focus-visible:border-[rgba(88,116,255,0.38)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]",
            error ? "border-[rgba(251,113,133,0.36)] focus-visible:border-[rgba(251,113,133,0.46)]" : "",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
          aria-hidden="true"
        />
      </div>
      {error ? (
        <span id={errorId} className="text-xs text-[var(--status-danger)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}
