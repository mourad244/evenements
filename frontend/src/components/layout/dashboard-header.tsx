type DashboardHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function DashboardHeader({
  eyebrow = "Workspace",
  title,
  description
}: DashboardHeaderProps) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-soft">
      <div className="grid gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-600">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="max-w-3xl text-sm text-slate-600 sm:text-base">{description}</p>
      </div>
    </div>
  );
}
