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
    return <LoadingState label="Loading event details..." minHeightClassName="min-h-[40vh]" variant="detail" />;
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
      <section className="rounded-[32px] border border-[rgba(88,116,255,0.2)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.16),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] p-5 shadow-[0_26px_58px_rgba(17,28,66,0.28)] sm:p-6">
        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
            Reserve your place
          </p>
          <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Continue with registration when you are ready. Your place, status, and ticket readiness will stay visible in your participant workspace.
          </p>
        </div>
        <div className="mt-4">
          <RegistrationButton eventId={data.id} />
        </div>
      </section>
    </div>
  );
}
