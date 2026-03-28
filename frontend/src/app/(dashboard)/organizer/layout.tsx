"use client";

import type { ReactNode } from "react";

import { RoleGuard } from "@/components/guards/role-guard";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

export default function OrganizerLayout({ children }: { children: ReactNode }) {
  const { data: user } = useCurrentUser();

  return (
    <RoleGuard user={user} allowedRoles={["ORGANIZER", "ADMIN"]}>
      <DashboardLayout
        eyebrow="Organizer workspace"
        title="Organizer control center"
        description="Create, refine, publish, and review event operations from one responsive workspace."
        sidebarTitle="Organizer workspace"
        sidebarDescription="Manage event inventory and prepare publication workflows."
        sidebarLinks={[
          { href: "/organizer/events", label: "My events" },
          { href: "/organizer/events/new", label: "Create event" }
        ]}
      >
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
