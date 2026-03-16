import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

type SummaryCardProps = {
  label: string;
  value: string;
  description: string;
  accent?: "default" | "highlight";
  className?: string;
};

export function SummaryCard({
  label,
  value,
  description,
  accent = "default",
  className
}: SummaryCardProps) {
  return (
    <Card
      aria-label={label}
      className={cn(
        "relative grid gap-4 overflow-hidden border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))] shadow-[0_22px_50px_rgba(0,0,0,0.3)] sm:gap-4.5",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]",
        accent === "highlight"
          ? "border-[rgba(88,116,255,0.28)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.22),transparent_34%),linear-gradient(180deg,rgba(20,31,54,0.96),rgba(10,17,30,0.98))] shadow-[0_24px_54px_rgba(26,43,104,0.28)]"
          : "",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          {label}
        </p>
        <span
          className={cn(
            "mt-0.5 h-2.5 w-2.5 rounded-full",
            accent === "highlight"
              ? "bg-[var(--accent-primary-strong)] shadow-[0_0_18px_rgba(88,116,255,0.8)]"
              : "bg-[var(--accent-warm)] shadow-[0_0_16px_rgba(243,154,99,0.55)]"
          )}
        />
      </div>
      <div className="grid gap-2">
        <p className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] tabular-nums sm:text-4xl">
          {value}
        </p>
        <p className="max-w-[28ch] text-sm leading-6 text-[var(--text-secondary)]">
          {description}
        </p>
      </div>
    </Card>
  );
}
