export function Footer() {
  return (
    <footer className="border-t border-white/70 bg-white/80 backdrop-blur">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.4fr_0.8fr_0.8fr] lg:px-8">
        <div className="grid gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
            EventOS
          </p>
          <h2 className="text-lg font-semibold text-ink">
            Startup-grade frontend shell for a microservices event platform.
          </h2>
          <p className="max-w-xl text-sm text-slate-600">
            Built to connect cleanly across identity, catalog, event management,
            registrations, notifications, payments, and admin operations.
          </p>
        </div>
        <div className="grid gap-2 text-sm text-slate-600">
          <p className="font-medium text-ink">Platform areas</p>
          <p>Public discovery</p>
          <p>Organizer workspace</p>
          <p>Admin console</p>
        </div>
        <div className="grid gap-2 text-sm text-slate-600">
          <p className="font-medium text-ink">Frontend stack</p>
          <p>Next.js App Router</p>
          <p>TypeScript and Tailwind</p>
          <p>Feature-based architecture</p>
        </div>
      </div>
      <div className="border-t border-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>EventOS frontend starter</p>
          <p>Prepared for production integration with backend services</p>
        </div>
      </div>
    </footer>
  );
}
