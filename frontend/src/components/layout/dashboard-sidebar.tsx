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

  return (
    <aside className="grid gap-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-soft">
        <div className="grid gap-2">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
      <nav className="grid grid-cols-2 gap-2 rounded-[28px] border border-white/70 bg-white/90 p-3 shadow-soft sm:grid-cols-3 lg:grid-cols-1 lg:p-4">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-2xl px-4 py-3 text-sm font-medium transition",
                active
                  ? "bg-ink text-white shadow-lg shadow-slate-900/10"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
