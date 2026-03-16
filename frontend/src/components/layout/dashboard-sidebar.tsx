"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

export type DashboardLink = {
  href: string;
  label: string;
};

type DashboardSidebarProps = {
  title: string;
  description: string;
  links: DashboardLink[];
};

export function DashboardSidebar({ title, description, links }: DashboardSidebarProps) {
  const pathname = usePathname();
  const activeLink = links.find(
    (link) => pathname === link.href || pathname.startsWith(`${link.href}/`)
  );
  const navigationLabel = `${title} navigation`;

  return (
    <aside aria-label={`${title} sidebar`} className="grid gap-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-[32px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.94),rgba(10,17,30,0.98))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.34)]">
        <div className="grid gap-3">
          <div className="grid gap-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary-strong)]">
              Workspace
            </p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
          </div>
          {activeLink ? (
            <div className="rounded-3xl border border-[rgba(88,116,255,0.26)] bg-[linear-gradient(135deg,rgba(88,116,255,0.18),rgba(65,93,255,0.08))] px-4 py-3 shadow-[0_14px_28px_rgba(65,93,255,0.14)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Current section
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{activeLink.label}</p>
            </div>
          ) : null}
          <div className="grid gap-2">
            <p className="text-sm text-[var(--text-secondary)]">{description}</p>
          </div>
        </div>
      </div>
      <nav
        aria-label={navigationLabel}
        className="grid grid-cols-1 gap-2 rounded-[32px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.94),rgba(9,15,26,0.98))] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.32)] sm:grid-cols-2 lg:grid-cols-1 lg:p-4"
      >
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-3xl border px-4 py-3 text-sm font-medium transition-[transform,box-shadow,border-color,background-color,color] duration-200 ease-out motion-safe:hover:-translate-y-px active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-1)]",
                active
                  ? "border-[rgba(88,116,255,0.42)] bg-[linear-gradient(135deg,rgba(88,116,255,0.28),rgba(65,93,255,0.12))] text-[var(--text-primary)] shadow-[0_16px_36px_rgba(65,93,255,0.18)]"
                  : "border-[var(--line-soft)] bg-[rgba(16,26,45,0.78)] text-[var(--text-secondary)] hover:bg-[rgba(22,36,58,0.92)] hover:text-[var(--text-primary)]"
              )}
            >
              <span className="flex items-center justify-between gap-3">
                <span>{link.label}</span>
                {active ? (
                  <span className="rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-primary)]">
                    Here
                  </span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
