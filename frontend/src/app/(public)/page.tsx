import {
  ArrowRight,
  CalendarRange,
  FolderTree,
  Layers3,
  ShieldCheck,
  Ticket,
  Workflow
} from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/lib/constants/routes";

const topMeta = [
  "Gateway-first API surface",
  "3 core backend services",
  "Next.js public + workspace shell",
  "Docs, Docker, and smoke tests"
] as const;

const quickSections = [
  { href: "#surfaces", label: "Platform surfaces" },
  { href: "#flow", label: "Runtime flow" },
  { href: "#repo", label: "Repository map" },
  { href: "#delivery", label: "Delivery toolbox" }
] as const;

const platformSurfaces = [
  {
    title: "Identity and access",
    route: "/api/auth/*",
    description:
      "Registration, login, refresh, password reset, and role-aware user context for the rest of the platform.",
    accent: "from-indigo-500 to-violet-500",
    icon: ShieldCheck
  },
  {
    title: "Event management",
    route: "/api/events/*",
    description:
      "Organizer drafts, publication workflow, admin event visibility, and the public catalog entry point.",
    accent: "from-emerald-500 to-teal-500",
    icon: CalendarRange
  },
  {
    title: "Registrations and tickets",
    route: "/api/registrations/*",
    description:
      "Participant registrations, waitlist transitions, organizer exports, notifications, and payment handoffs.",
    accent: "from-amber-500 to-orange-500",
    icon: Ticket
  },
  {
    title: "Frontend shell",
    route: "frontend/src/*",
    description:
      "Public discovery plus participant, organizer, and admin workspaces connected through a feature-based Next.js structure.",
    accent: "from-rose-500 to-pink-500",
    icon: Layers3
  }
] as const;

const runtimeFlow = [
  {
    step: "01",
    title: "Public shell",
    description:
      "Pages live in the App Router and feature modules keep API calls, forms, and views grouped by domain.",
    details: "frontend/src/app + frontend/src/features"
  },
  {
    step: "02",
    title: "Gateway contract",
    description:
      "The gateway owns the public /api surface, JWT validation, ACL checks, and request forwarding.",
    details: "services/api-gateway/src/routing.js"
  },
  {
    step: "03",
    title: "Domain services",
    description:
      "Each service keeps its own Express routes, repository layer, and database schema for its bounded context.",
    details: "identity, event-management, registration"
  },
  {
    step: "04",
    title: "Persistence and verification",
    description:
      "Postgres powers the runtime while root-level smoke and unit tests validate the expected behavior.",
    details: "docker-compose*.yml + tests/*.test.js"
  }
] as const;

const repoAreas = [
  {
    title: "Documentation source of truth",
    path: "docs/",
    summary:
      "Architecture, service specs, workflows, sprint plans, and the project backlog live here.",
    firstRead: "Start with docs/DOCUMENTATION_INDEX.md and service specs."
  },
  {
    title: "Backend services",
    path: "services/",
    summary:
      "The runtime backend is split into gateway, identity, event management, and registration domains.",
    firstRead: "Open api-gateway routing first, then follow each service index.js."
  },
  {
    title: "Frontend application",
    path: "frontend/",
    summary:
      "The Next.js app separates route groups from reusable UI and feature modules for auth, events, and registrations.",
    firstRead: "Read src/app, then trace a feature folder end to end."
  },
  {
    title: "Executable expectations",
    path: "tests/",
    summary:
      "The tests provide the clearest short path to understand what the MVP currently promises.",
    firstRead: "Use the sprint-tagged test files as behavior references."
  }
] as const;

const deliveryTools = [
  {
    label: "Run the frontend",
    command: "pnpm start:frontend",
    note: "Starts the Next.js shell."
  },
  {
    label: "Run the gateway",
    command: "pnpm start:gateway",
    note: "Exposes the public /api surface."
  },
  {
    label: "Bring up Postgres",
    command: "pnpm compose:s1-m01:up",
    note: "Boots the Sprint 1 local database."
  },
  {
    label: "Verify core flows",
    command: "pnpm test:s1-m01",
    note: "Runs the main MVP backend smoke test."
  }
] as const;

function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(129,140,248,0.95)]">
        {eyebrow}
      </p>
      <div className="grid gap-2">
        <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950 sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="grid gap-8 lg:gap-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
        <div className="relative overflow-hidden rounded-[36px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,247,251,0.98))] p-6 text-slate-900 shadow-[0_28px_70px_rgba(15,23,42,0.18)] sm:p-8 lg:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#4f46e5_0%,#10b981_38%,#f59e0b_68%,#f43f5e_100%)] opacity-80" />
          <div className="grid gap-8">
            <div className="flex flex-wrap gap-2">
              {topMeta.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-medium tracking-[0.03em] text-slate-600"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="grid gap-5">
              <div className="grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-indigo-600">
                  Event platform control map
                </p>
                <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-5xl">
                  Architecture, public discovery, and operations aligned in one project surface.
                </h1>
              </div>

              <p className="max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                Inspired by the technical deliverables layout, this entry page now frames the
                platform as a living system: gateway-first routing, role-aware workspaces, domain
                services, executable tests, and a repository map you can navigate quickly.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={ROUTES.events}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-indigo-500 bg-[linear-gradient(135deg,#4f46e5,#6366f1)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(79,70,229,0.28)] transition-transform duration-200 ease-out hover:-translate-y-px"
              >
                Browse events
              </Link>
              <Link
                href={ROUTES.login}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-[0_12px_26px_rgba(15,23,42,0.08)] transition-transform duration-200 ease-out hover:-translate-y-px"
              >
                Sign in to a workspace
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-slate-200 bg-white/90 px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Public areas
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">4</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Home, catalog, auth flows, and session recovery.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white/90 px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Runtime services
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">3</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Identity, event management, and registrations behind one gateway.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-white/90 px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Project anchors
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-slate-950">4</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Docs, services, frontend, and tests drive navigation.
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-[36px] border border-[rgba(129,140,248,0.18)] bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(7,12,22,0.98))] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.34)] sm:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)]" />
          <div className="grid gap-6">
            <div className="grid gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
                Runtime snapshot
              </p>
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                One public shell, one gateway, multiple domain lanes.
              </h2>
              <p className="text-sm leading-7 text-[var(--text-secondary)]">
                The current repo already behaves like a delivery cockpit: route contracts in the
                gateway, service-local schema ownership, and tests that mirror sprint slices.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                ["Gateway", "Maps /api/* routes and forwards authenticated traffic."],
                ["Identity service", "Owns users, sessions, reset tokens, and auth audit logs."],
                ["Event service", "Owns drafts, publication, catalog exposure, and organizer views."],
                ["Registration service", "Owns waitlists, tickets, notifications, payments, and exports."]
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.7)] px-4 py-4"
                >
                  <p className="font-[family:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--accent-primary-strong)]">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-[rgba(243,154,99,0.22)] bg-[rgba(243,154,99,0.08)] px-4 py-4">
              <p className="font-[family:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[var(--accent-warm)]">
                Suggested first read
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">
                Start with <span className="font-semibold">gateway routing</span>, then follow one
                service end to end: <span className="font-semibold">schema</span>,
                <span className="font-semibold"> repository</span>, <span className="font-semibold">index</span>,
                and finally the matching <span className="font-semibold">frontend feature</span>.
              </p>
            </div>
          </div>
        </aside>
      </section>

      <nav
        aria-label="Homepage sections"
        className="flex flex-wrap gap-2 rounded-[28px] border border-black/8 bg-[rgba(255,255,255,0.92)] p-3 shadow-[0_18px_44px_rgba(15,23,42,0.12)]"
      >
        {quickSections.map((item, index) => (
          <a
            key={item.href}
            href={item.href}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:bg-white hover:text-slate-950"
          >
            <span className="font-[family:var(--font-mono)] text-[11px] text-slate-400">
              0{index + 1}
            </span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <section
        id="surfaces"
        className="rounded-[36px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,249,252,0.98))] p-6 shadow-[0_28px_70px_rgba(15,23,42,0.14)] sm:p-8"
      >
        <div className="grid gap-8">
          <SectionHeading
            eyebrow="Platform surfaces"
            title="Each lane has a clear responsibility and a visible entry path."
            description="The HTML reference worked because it grouped information into crisp, colored technical surfaces. This section applies the same idea to the current project architecture."
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {platformSurfaces.map(({ title, route, description, accent, icon: Icon }) => (
              <div
                key={title}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_38px_rgba(15,23,42,0.08)]"
              >
                <div className={`h-1.5 bg-gradient-to-r ${accent}`} />
                <div className="grid gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="grid gap-1.5">
                      <p className="text-sm font-semibold tracking-[-0.02em] text-slate-950">
                        {title}
                      </p>
                      <p className="font-[family:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-slate-500">
                        {route}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="flow"
        className="rounded-[36px] border border-[rgba(129,140,248,0.18)] bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(7,12,22,0.98))] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.34)] sm:p-8"
      >
        <div className="grid gap-8">
          <div className="grid gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
              Runtime flow
            </p>
            <div className="grid gap-2">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)] sm:text-3xl">
                Follow the request path before reading the rest of the codebase.
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                This is the fastest mental model for the repo: UI surface, gateway contract, domain
                service ownership, then persistence and tests.
              </p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[repeat(4,minmax(0,1fr))]">
            {runtimeFlow.map((item, index) => (
              <div key={item.step} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto]">
                <div className="rounded-[28px] border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.72)] p-5 shadow-[0_18px_42px_rgba(0,0,0,0.18)]">
                  <p className="font-[family:var(--font-mono)] text-[11px] uppercase tracking-[0.2em] text-[var(--accent-primary-strong)]">
                    Step {item.step}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                  <p className="mt-4 font-[family:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    {item.details}
                  </p>
                </div>
                {index < runtimeFlow.length - 1 ? (
                  <div className="hidden items-center justify-center xl:flex">
                    <ArrowRight className="h-5 w-5 text-[var(--text-muted)]" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="repo"
        className="rounded-[36px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,247,251,0.98))] p-6 shadow-[0_28px_70px_rgba(15,23,42,0.14)] sm:p-8"
      >
        <div className="grid gap-8">
          <SectionHeading
            eyebrow="Repository map"
            title="The project is easier to navigate when you treat folders as responsibilities."
            description="The original HTML organized deliverables by layers and tabs. Here, that idea becomes a concrete repository map for new contributors."
          />

          <div className="grid gap-4 lg:grid-cols-2">
            {repoAreas.map((area) => (
              <div
                key={area.path}
                className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_38px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid gap-1.5">
                    <p className="text-lg font-semibold tracking-[-0.02em] text-slate-950">
                      {area.title}
                    </p>
                    <p className="font-[family:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      {area.path}
                    </p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
                    <FolderTree className="h-5 w-5" />
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{area.summary}</p>
                <div className="mt-4 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="font-[family:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    First read
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{area.firstRead}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="delivery"
        className="rounded-[36px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,249,252,0.98))] p-6 shadow-[0_28px_70px_rgba(15,23,42,0.14)] sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
          <div className="grid gap-6">
            <SectionHeading
              eyebrow="Delivery toolbox"
              title="Keep runtime, docs, and verification visible from the public shell."
              description="The referenced HTML felt useful because it exposed concrete deliverables, not just marketing text. This project benefits from the same practical cues."
            />

            <div className="grid gap-4">
              {deliveryTools.map((tool) => (
                <div
                  key={tool.command}
                  className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="grid gap-1">
                    <p className="text-sm font-semibold text-slate-950">{tool.label}</p>
                    <p className="text-sm text-slate-600">{tool.note}</p>
                  </div>
                  <code className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] text-slate-700">
                    {tool.command}
                  </code>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[rgba(129,140,248,0.18)] bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(7,12,22,0.98))] p-6 shadow-[0_28px_70px_rgba(0,0,0,0.34)]">
            <div className="grid gap-5">
              <div className="grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
                  Why this direction works
                </p>
                <h3 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
                  The project now reads more like an operational blueprint.
                </h3>
              </div>

              <div className="grid gap-3">
                {[
                  "A denser home page explains the repo instead of repeating generic product copy.",
                  "The visual language borrows the reference HTML's technical chips, structured cards, and layered information density.",
                  "New contributors can jump from this page to routes, services, tests, and runtime commands without guessing."
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-[22px] border border-[rgba(148,163,184,0.18)] bg-[rgba(15,23,42,0.7)] px-4 py-4"
                  >
                    <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-[rgba(148,163,184,0.18)] bg-[rgba(255,255,255,0.04)] text-[var(--text-primary)]">
                      <Workflow className="h-4 w-4" />
                    </span>
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">{item}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] border border-[rgba(52,211,153,0.18)] bg-[rgba(52,211,153,0.08)] px-4 py-4">
                <p className="font-[family:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[var(--status-success)]">
                  Suggested next step
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">
                  Apply the same treatment to the public events catalog next: stronger sectioning,
                  clearer filtering hierarchy, and a tighter “route to service” mental model.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Link
          href={ROUTES.events}
          className="rounded-[32px] border border-black/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,247,251,0.98))] p-6 shadow-[0_20px_52px_rgba(15,23,42,0.12)] transition-transform duration-200 ease-out hover:-translate-y-px"
        >
          <div className="grid gap-2">
            <p className="font-[family:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Public route
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              Explore the catalog
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Jump into the public event discovery flow and compare the page structure with the
              new technical landing direction.
            </p>
          </div>
        </Link>

        <Link
          href={ROUTES.login}
          className="rounded-[32px] border border-[rgba(129,140,248,0.18)] bg-[linear-gradient(180deg,rgba(11,18,32,0.96),rgba(7,12,22,0.98))] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.32)] transition-transform duration-200 ease-out hover:-translate-y-px"
        >
          <div className="grid gap-2">
            <p className="font-[family:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[var(--accent-primary-strong)]">
              Workspace route
            </p>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
              Open a role-based workspace
            </h2>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Sign in to review participant, organizer, or admin surfaces that already exist behind
              the public shell.
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
}
