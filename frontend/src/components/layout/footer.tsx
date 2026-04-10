const footerColumns = [
  {
    title: "Platform lanes",
    items: ["Public discovery", "Participant history", "Organizer operations", "Admin review"]
  },
  {
    title: "Runtime map",
    items: ["API gateway", "Identity service", "Event management", "Registration service"]
  },
  {
    title: "Project anchors",
    items: ["docs/", "services/", "frontend/", "tests/"]
  }
] as const;

export function Footer() {
  return (
    <footer className="border-t border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(246,247,251,0.94))] backdrop-blur">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.4fr_repeat(3,minmax(0,0.8fr))] lg:px-8">
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            {["Gateway-first", "Role-aware", "Docs-backed"].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium tracking-[0.03em] text-slate-600"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="grid gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
              EventOS
            </p>
            <h2 className="max-w-xl text-lg font-semibold tracking-[-0.02em] text-slate-950">
              A public shell and workspace system for an event platform shaped by microservice
              boundaries.
            </h2>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              The frontend now presents the project less like a generic starter and more like an
              operational map: routes, services, docs, tests, and delivery cues all stay visible.
            </p>
          </div>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title} className="grid gap-3 text-sm text-slate-600">
            <p className="font-[family:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-slate-500">
              {column.title}
            </p>
            {column.items.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>Frontend shell aligned with gateway, services, docs, and tests</p>
          <p>Built with Next.js App Router, TypeScript, Tailwind, and feature-based modules</p>
        </div>
      </div>
    </footer>
  );
}
