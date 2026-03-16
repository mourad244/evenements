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
    <div
      aria-label={`${title} overview`}
      className="rounded-[32px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.94),rgba(10,17,30,0.98))] p-6 shadow-[0_28px_64px_rgba(0,0,0,0.36)]"
    >
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
            {eyebrow}
          </p>
          <span className="rounded-full border border-[var(--line-soft)] bg-[rgba(16,26,45,0.82)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
            Current workspace
          </span>
        </div>
        <div className="grid gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-3xl text-sm text-[var(--text-secondary)] sm:text-base">{description}</p>
        </div>
      </div>
    </div>
  );
}
