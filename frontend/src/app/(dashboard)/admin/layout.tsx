"use client";

import type { ReactNode } from "react";

import { RoleGuard } from "@/components/guards/role-guard";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: user } = useCurrentUser();

  return (
    <RoleGuard user={user} allowedRoles={["ADMIN"]}>
      <DashboardLayout
        eyebrow="Admin workspace"
        title="Operations console"
        description="Monitor platform inventory, user activity, and administrative workflows from a single shell."
        sidebarTitle="Admin workspace"
        sidebarDescription="Oversee platform-level inventory and user operations."
        sidebarLinks={[
          { href: "/admin/events", label: "Events" },
          { href: "/admin/users", label: "Users" }
        ]}
      >
        {children}
      </DashboardLayout>
    </RoleGuard>
  );
}
