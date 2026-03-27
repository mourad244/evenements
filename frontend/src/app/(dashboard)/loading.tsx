import { PageTitle } from "@/components/shared/page-title";

export default function DashboardLoading() {
  return (
    <div className="grid gap-8 animate-pulse">
      <div className="h-10 w-1/3 rounded-md surface-premium"></div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-xl surface-premium border border-[var(--line-soft)]" />
        ))}
      </div>
      <div className="h-96 w-full rounded-xl surface-premium border border-[var(--line-soft)] lg:col-span-2" />
    </div>
  );
}
