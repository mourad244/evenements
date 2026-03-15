"use client";

import { useParams } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { EventDetails } from "@/features/events/components/event-details";
import { RegistrationButton } from "@/features/registrations/components/registration-button";
import { useEventDetailsQuery } from "@/features/events/hooks/use-event-details-query";

export default function EventDetailsPage() {
  const params = useParams<{ eventId: string }>();
  const { data, isLoading, isError, error } = useEventDetailsQuery(params.eventId);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="text-sm text-slate-600">
        <p className="font-semibold text-ink">Could not load event details.</p>
        <p className="mt-2">{error.message}</p>
      </Card>
    );
  }

  if (!data) {
    return <Card>Event not found.</Card>;
  }

  return (
    <div className="grid gap-8">
      <EventDetails event={data} />
      <RegistrationButton eventId={data.id} />
    </div>
  );
}
