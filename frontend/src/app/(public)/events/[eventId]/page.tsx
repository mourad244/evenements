"use client";

import { useParams } from "next/navigation";

import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { UnavailableState } from "@/components/ui/unavailable-state";
import { EventDetails } from "@/features/events/components/event-details";
import { RegistrationButton } from "@/features/registrations/components/registration-button";
import { useEventDetailsQuery } from "@/features/events/hooks/use-event-details-query";

export default function EventDetailsPage() {
  const params = useParams<{ eventId: string }>();
  const { data, isLoading, isError, error } = useEventDetailsQuery(params.eventId);

  if (isLoading) {
    return <LoadingState label="Loading event details..." minHeightClassName="min-h-[40vh]" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Could not load event details"
        description={error.message}
      />
    );
  }

  if (!data) {
    return (
      <UnavailableState
        title="Event not found"
        description="This event is unavailable or may have been removed."
      />
    );
  }

  return (
    <div className="grid gap-8">
      <EventDetails event={data} />
      <RegistrationButton eventId={data.id} />
    </div>
  );
}
