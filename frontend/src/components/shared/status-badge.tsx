import { cn } from "@/lib/utils/cn";

type StatusBadgeProps = {
  status: string;
};

const toneMap: Record<string, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  WAITLISTED: "bg-amber-50 text-amber-700",
  CANCELLED: "bg-rose-50 text-rose-700",
  DRAFT: "bg-slate-100 text-slate-700",
  PUBLISHED: "bg-brand-50 text-brand-700"
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        toneMap[status] || "bg-slate-100 text-slate-700"
      )}
    >
      {status}
    </span>
  );
}
