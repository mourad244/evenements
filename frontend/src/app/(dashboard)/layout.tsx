"use client";

import type { ReactNode } from "react";

import { AuthGuard } from "@/components/guards/auth-guard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
