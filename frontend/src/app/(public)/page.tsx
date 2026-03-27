import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageTitle } from "@/components/shared/page-title";
import { ROUTES } from "@/lib/constants/routes";

export default function HomePage() {
  return (
    <div className="grid gap-10">
      <Card className="grid gap-8 surface-premium p-8 sm:p-12">
        <PageTitle
          eyebrow="Event management"
          title="Run public events, registrations, and back-office flows from one frontend shell."
          description="A startup-grade Next.js starter built for clean UX and future microservice integration across auth, events, registrations, admin, notifications, and payments."
        />
        <div className="flex flex-wrap gap-4">
          <Link href={ROUTES.events}><Button>Browse events</Button></Link>
          <Link href={ROUTES.login}><Button variant="ghost">Sign in</Button></Link>
        </div>
      </Card>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          ["Public catalog", "Responsive event discovery pages with clean filters and content structure."],
          ["Participant flows", "Login, registrations, and dashboard states designed for real backend wiring."],
          ["Organizer and admin", "Dedicated workspaces ready for event operations and moderation interfaces."]
        ].map(([title, description]) => (
          <Card key={title} className="grid gap-3">
            <h2 className="text-xl font-semibold text-ink">{title}</h2>
            <p className="text-sm text-[var(--text-secondary)]">{description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
