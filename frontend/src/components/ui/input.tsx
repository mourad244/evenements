import { useId, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export function Input({ className, label, hint, error, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <label className="grid gap-2.5 text-sm text-[var(--text-secondary)]" htmlFor={inputId}>
      {label ? (
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          {label}
        </span>
      ) : null}
      <input
        id={inputId}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        aria-errormessage={errorId}
        className={cn(
          "h-12 rounded-[22px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.96),rgba(10,17,30,0.98))] px-4 text-sm text-[var(--text-primary)] outline-none ring-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition placeholder:text-[var(--text-muted)] focus-visible:border-[rgba(88,116,255,0.38)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]",
          error
            ? "border-[rgba(251,113,133,0.36)] focus-visible:border-[rgba(251,113,133,0.46)] focus-visible:ring-[rgba(251,113,133,0.18)]"
            : "",
          className
        )}
        {...props}
      />
      {hint ? (
        <span id={hintId} className="text-xs text-[var(--text-muted)]">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={errorId} className="text-xs text-[var(--status-danger)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}
