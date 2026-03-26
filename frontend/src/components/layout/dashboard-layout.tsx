"use client";

import type { ReactNode } from "react";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar, type DashboardLink } from "@/components/layout/dashboard-sidebar";

type DashboardLayoutProps = {
  eyebrow?: string;
  title: string;
  description: string;
  sidebarTitle: string;
  sidebarDescription: string;
  sidebarLinks: DashboardLink[];
  children: ReactNode;
};

export function DashboardLayout({
  eyebrow,
  title,
  description,
  sidebarTitle,
  sidebarDescription,
  sidebarLinks,
  children
}: DashboardLayoutProps) {
  return (
    <div className="grid gap-6 xl:gap-8 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
      <DashboardSidebar
        title={sidebarTitle}
        description={sidebarDescription}
        links={sidebarLinks}
      />
      <section
        aria-label={`${title} content`}
        className="grid min-w-0 gap-6 xl:gap-8"
      >
        <DashboardHeader eyebrow={eyebrow} title={title} description={description} />
        <div className="grid gap-6 rounded-[32px] border border-[var(--line-soft)] bg-[rgba(8,13,24,0.34)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
          {children}
        </div>
      </section>
    </div>
  );
}
