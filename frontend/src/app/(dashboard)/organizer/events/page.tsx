"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EventList } from "@/features/events/components/event-list";
import { useOrganizerEventsQuery } from "@/features/events/hooks/use-organizer-events-query";
import { PageTitle } from "@/components/shared/page-title";

export default function OrganizerEventsPage() {
  const { data = [] } = useOrganizerEventsQuery();

  return (
    <div className="grid gap-6">
      <PageTitle
        eyebrow="Organizer"
        title="Organizer events"
        description="This view is now wired to the managed event gateway endpoint."
      />
      <Card className="flex justify-end">
        <Link href="/organizer/events/new"><Button>Create event</Button></Link>
      </Card>
      <EventList events={data} />
    </div>
  );
}
