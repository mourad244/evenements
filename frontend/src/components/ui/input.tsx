import { useId, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ className, label, error, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <label className="grid gap-2 text-sm text-slate-700" htmlFor={inputId}>
      {label ? <span className="font-medium">{label}</span> : null}
      <input
        id={inputId}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={errorId}
        className={cn(
          "h-11 rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none ring-0 transition placeholder:text-slate-400 focus-visible:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-100",
          error ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "",
          className
        )}
        {...props}
      />
      {error ? (
        <span id={errorId} className="text-xs text-red-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}
