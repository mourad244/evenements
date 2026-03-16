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
    <label className="grid gap-2 text-sm text-slate-700" htmlFor={inputId}>
      <span className="font-medium">{label}</span>
      <span className="relative block">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={errorId}
          className={cn(
            "h-11 w-full rounded-2xl border border-line bg-white px-4 pr-12 text-sm text-ink outline-none ring-0 transition placeholder:text-slate-400 focus-visible:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-100",
            error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "",
            className
          )}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center rounded-r-2xl text-slate-500 transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
      {error ? (
        <span id={errorId} className="text-xs text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}
