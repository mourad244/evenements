import Link from "next/link";
import { Calendar, CheckCircle, LayoutDashboard, Search, Ticket, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants/routes";

const stats = [
  { value: "500+", label: "Events published" },
  { value: "12 000+", label: "Registered participants" },
  { value: "200+", label: "Active organizers" },
  { value: "98%", label: "Ticket delivery rate" }
];

const features = [
  {
    icon: Search,
    title: "Discover events",
    description:
      "Browse hundreds of public events by city, date, theme, or price. Find what matters to you and register in seconds."
  },
  {
    icon: Ticket,
    title: "Register & get your ticket",
    description:
      "Confirm your spot, track your waitlist position, and download your ticket once payment is confirmed — all from your dashboard."
  },
  {
    icon: LayoutDashboard,
    title: "Organizer workspace",
    description:
      "Create and publish events, manage participant registrations, approve or reject requests, and monitor your audience in real time."
  }
];

const steps = [
  {
    number: "01",
    title: "Create your account",
    description: "Sign up as a participant or organizer. Takes less than a minute."
  },
  {
    number: "02",
    title: "Browse or create events",
    description: "Discover upcoming events near you, or publish your own to the public catalog."
  },
  {
    number: "03",
    title: "Register and attend",
    description: "Secure your place, receive your ticket, and get notified about any updates."
  }
];

export default function HomePage() {
  return (
    <div className="grid gap-20">

      {/* Hero */}
      <section className="relative grid gap-8 py-6 lg:py-10">
        <div className="pointer-events-none absolute -inset-x-8 -top-8 h-[480px] rounded-[48px] bg-[radial-gradient(ellipse_at_top,rgba(65,93,255,0.18),transparent_60%)]" />
        <div className="relative grid gap-6 lg:max-w-3xl">
          <Badge>Event management platform</Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
            Your events,{" "}
            <span className="bg-[linear-gradient(135deg,#5874ff,#f39a63)] bg-clip-text text-transparent">
              perfectly organized.
            </span>
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[var(--text-secondary)] sm:text-lg">
            Discover events near you, register as a participant, and get your ticket — or publish and manage your own events as an organizer. Everything in one place.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href={ROUTES.events}>
              <Button className="px-8">Browse events</Button>
            </Link>
            <Link href={ROUTES.register}>
              <Button variant="ghost" className="px-8">Create account</Button>
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="grid gap-1 rounded-[22px] border border-[var(--line-soft)] bg-[rgba(16,26,45,0.72)] px-5 py-4"
            >
              <p className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                {stat.value}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-8">
        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
            What you can do
          </p>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
            One platform, every role.
          </h2>
          <p className="max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
            Whether you are attending your first event or running your hundredth, EventOS gives each role the tools it needs.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="grid gap-4 border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(18,28,46,0.92),rgba(10,17,30,0.98))]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(88,116,255,0.28)] bg-[rgba(65,93,255,0.16)] text-[var(--accent-primary-strong)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="grid gap-2">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-6 text-[var(--text-secondary)]">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="grid gap-8">
        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
            How it works
          </p>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
            Up and running in minutes.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="grid gap-3 rounded-[28px] border border-[var(--line-soft)] bg-[rgba(12,20,35,0.6)] p-6"
            >
              <p className="text-3xl font-semibold tracking-tight text-[rgba(88,116,255,0.4)]">
                {step.number}
              </p>
              <div className="grid gap-1.5">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">{step.title}</h3>
                <p className="text-sm leading-6 text-[var(--text-secondary)]">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Organizer CTA */}
      <section>
        <Card className="relative grid gap-6 overflow-hidden border-[rgba(243,154,99,0.22)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.14),transparent_40%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] p-8 shadow-[0_28px_64px_rgba(0,0,0,0.28)] sm:p-10 lg:flex-row">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(243,154,99,0.4),transparent)]" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid gap-3 lg:max-w-xl">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[var(--accent-warm)]" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-warm)]">
                  For organizers
                </p>
              </div>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
                Ready to host your next event?
              </h2>
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Create your organizer account, publish your event to the catalog, manage registrations, and keep your participants informed — all from one workspace.
              </p>
              <ul className="grid gap-2">
                {[
                  "Draft and publish events in minutes",
                  "Accept or reject registrations manually",
                  "Automatic ticket generation on payment"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <CheckCircle className="h-4 w-4 shrink-0 text-[var(--status-success)]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
              <Link href={ROUTES.register}>
                <Button className="w-full bg-[linear-gradient(135deg,rgba(243,154,99,0.9),rgba(230,120,60,0.85))] text-white shadow-[0_14px_32px_rgba(243,154,99,0.3)] hover:shadow-[0_18px_40px_rgba(243,154,99,0.4)]">
                  Start as organizer
                </Button>
              </Link>
              <Link href={ROUTES.events}>
                <Button variant="ghost" className="w-full">
                  Explore events first
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </section>

    </div>
  );
}
