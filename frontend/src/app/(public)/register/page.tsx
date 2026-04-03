import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus, Users, Zap } from "lucide-react";

import { PublicOnlyGuard } from "@/components/guards/public-only-guard";
import { RegisterForm } from "@/features/auth/components/register-form";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Create account"
};

const roles = [
  {
    icon: Zap,
    role: "Participant",
    description: "Discover events, register, join waitlists, and receive your ticket once confirmed."
  },
  {
    icon: CalendarPlus,
    role: "Organizer",
    description: "Create and publish events, manage registrations, and keep your audience informed."
  },
  {
    icon: Users,
    role: "Both welcome",
    description: "You can always use the platform across both roles — start with the one that fits you now."
  }
];

export default function RegisterPage() {
  return (
    <PublicOnlyGuard>
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">

        <Card className="relative grid gap-8 overflow-hidden border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.16),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(8,14,24,0.98))] shadow-[0_30px_70px_rgba(14,24,54,0.34)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]" />

          <div className="grid gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
              Join EventOS
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Create your free account.
            </h1>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Join thousands of participants and organizers already using EventOS to discover events, register, and manage their audiences.
            </p>
          </div>

          <ul className="grid gap-5">
            {roles.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.role} className="flex gap-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(88,116,255,0.28)] bg-[rgba(65,93,255,0.14)] text-[var(--accent-primary-strong)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="grid gap-0.5">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{item.role}</p>
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">{item.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="border-t border-[var(--line-soft)] pt-5 text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link href={ROUTES.login} className="font-semibold text-[var(--accent-primary-strong)] hover:text-[var(--text-primary)]">
              Sign in instead
            </Link>
          </p>
        </Card>

        <RegisterForm />
      </div>
    </PublicOnlyGuard>
  );
}
