"use client";

import { PageTitle } from "@/components/shared/page-title";
import { EventForm } from "@/features/events/components/event-form";
import { useCreateEventMutation } from "@/features/events/hooks/use-create-event-mutation";

export default function OrganizerNewEventPage() {
  const mutation = useCreateEventMutation();

  return (
    <div className="grid gap-6">
      <PageTitle
        eyebrow="Organizer"
        title="Create event"
        description="Draft a new event with typed form validation and gateway-backed mutation wiring."
      />
      <EventForm
        submitLabel={mutation.isPending ? "Saving..." : "Save event"}
        onSubmit={async (values) => mutation.mutateAsync(values)}
      />
    </div>
  );
}
