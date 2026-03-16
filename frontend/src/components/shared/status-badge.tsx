import { cn } from "@/lib/utils/cn";

type StatusBadgeProps = {
  status: string;
};

const toneMap: Record<string, string> = {
  CONFIRMED: "border-[rgba(52,211,153,0.24)] bg-[rgba(6,78,59,0.3)] text-[var(--status-success)]",
  WAITLISTED: "border-[rgba(245,195,95,0.24)] bg-[rgba(120,53,15,0.3)] text-[var(--status-warning)]",
  CANCELLED: "border-[rgba(251,113,133,0.22)] bg-[rgba(127,29,29,0.26)] text-[var(--status-danger)]",
  REJECTED: "border-[rgba(251,113,133,0.28)] bg-[rgba(127,29,29,0.34)] text-[var(--status-danger)]",
  DRAFT: "border-[var(--line-soft)] bg-[rgba(16,26,45,0.88)] text-[var(--text-secondary)]",
  PUBLISHED: "border-[rgba(88,116,255,0.26)] bg-[rgba(88,116,255,0.14)] text-[var(--accent-primary-strong)]"
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] shadow-[0_10px_20px_rgba(0,0,0,0.16)]",
        toneMap[status] || "border-[var(--line-soft)] bg-[rgba(16,26,45,0.88)] text-[var(--text-secondary)]"
      )}
    >
      {status}
    </span>
  );
}
