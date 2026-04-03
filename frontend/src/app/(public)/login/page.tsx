import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, ShieldCheck, Ticket } from "lucide-react";

import { PublicOnlyGuard } from "@/components/guards/public-only-guard";
import { LoginForm } from "@/features/auth/components/login-form";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";

export const metadata: Metadata = {
  title: "Sign in"
};

const benefits = [
  {
    icon: CalendarCheck,
    title: "Your registrations, always in reach",
    description: "Track every event you registered for, check your waitlist position, and see ticket readiness from one page."
  },
  {
    icon: Ticket,
    title: "Tickets ready when you are",
    description: "Once payment is confirmed your ticket is issued automatically. Access it any time from your dashboard."
  },
  {
    icon: ShieldCheck,
    title: "Secure and role-aware access",
    description: "Participants, organizers, and admins each get a workspace tailored to their role — nothing more, nothing less."
  }
];

export default function LoginPage() {
  return (
    <PublicOnlyGuard>
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">

        <Card className="relative grid gap-8 overflow-hidden border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.16),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(8,14,24,0.98))] shadow-[0_30px_70px_rgba(14,24,54,0.34)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]" />

          <div className="grid gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
              Welcome back
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Sign in to your EventOS account.
            </h1>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">
              Access your participant dashboard, organizer workspace, or admin console — everything picks up exactly where you left off.
            </p>
          </div>

          <ul className="grid gap-5">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <li key={benefit.title} className="flex gap-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(88,116,255,0.28)] bg-[rgba(65,93,255,0.14)] text-[var(--accent-primary-strong)]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="grid gap-0.5">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{benefit.title}</p>
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">{benefit.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="border-t border-[var(--line-soft)] pt-5 text-sm text-[var(--text-secondary)]">
            No account yet?{" "}
            <Link href={ROUTES.register} className="font-semibold text-[var(--accent-primary-strong)] hover:text-[var(--text-primary)]">
              Create one for free
            </Link>
          </p>
        </Card>

        <LoginForm />
      </div>
    </PublicOnlyGuard>
  );
}
