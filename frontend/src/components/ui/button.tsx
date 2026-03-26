import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "border border-[var(--line-strong)] bg-[linear-gradient(135deg,var(--accent-primary-strong),var(--accent-primary))] text-[var(--text-primary)] shadow-[0_16px_36px_rgba(65,93,255,0.28)] hover:brightness-110 hover:shadow-[0_20px_40px_rgba(65,93,255,0.34)] active:brightness-100",
  secondary:
    "border border-[var(--line-strong)] bg-[linear-gradient(180deg,rgba(19,31,51,0.98),rgba(11,18,32,0.98))] text-[var(--text-primary)] shadow-[0_16px_36px_rgba(0,0,0,0.28)] hover:border-[var(--accent-primary-soft)] hover:bg-[linear-gradient(180deg,rgba(24,38,62,0.98),rgba(13,22,37,0.98))] hover:shadow-[0_18px_40px_rgba(0,0,0,0.32)]",
  ghost:
    "border border-[var(--line-soft)] bg-[rgba(19,31,51,0.72)] text-[var(--text-primary)] shadow-[0_12px_28px_rgba(0,0,0,0.18)] hover:border-[var(--line-strong)] hover:bg-[rgba(26,41,66,0.84)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.24)]",
  danger:
    "border border-[rgba(251,113,133,0.22)] bg-[linear-gradient(135deg,rgba(190,24,93,0.95),rgba(136,19,55,0.95))] text-[var(--text-primary)] shadow-[0_16px_36px_rgba(136,19,55,0.34)] hover:brightness-110 hover:shadow-[0_20px_42px_rgba(136,19,55,0.4)] active:brightness-100"
};

export function Button({
  children,
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] px-4 py-2.5 text-sm font-semibold tracking-[0.01em] transition-[transform,box-shadow,background-color,border-color,filter] duration-200 ease-out motion-reduce:transition-none motion-safe:hover:-translate-y-px active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:scale-100",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
