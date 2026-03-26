"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function PasswordField({
  className,
  label,
  error,
  id,
  ...props
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [visible, setVisible] = useState(false);
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <label className="grid gap-2.5 text-sm text-[var(--text-secondary)]" htmlFor={inputId}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {label}
      </span>
      <span className="relative block">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={errorId}
          className={cn(
            "h-12 w-full rounded-[22px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.96),rgba(10,17,30,0.98))] px-4 pr-12 text-sm text-[var(--text-primary)] outline-none ring-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition placeholder:text-[var(--text-muted)] focus-visible:border-[rgba(88,116,255,0.38)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]",
            error
              ? "border-[rgba(251,113,133,0.36)] focus-visible:border-[rgba(251,113,133,0.46)] focus-visible:ring-[rgba(251,113,133,0.18)]"
              : "",
            className
          )}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-[22px] text-[var(--text-muted)] transition hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
      {error ? (
        <span id={errorId} className="text-xs text-[var(--status-danger)]">
          {error}
        </span>
      ) : null}
    </label>
  );
}
