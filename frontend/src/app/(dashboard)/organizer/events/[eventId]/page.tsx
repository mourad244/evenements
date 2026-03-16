"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

import { PageTitle } from "@/components/shared/page-title";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { EventForm } from "@/features/events/components/event-form";
import { useDeleteEventMutation } from "@/features/events/hooks/use-delete-event-mutation";
import { useOrganizerEventDetailsQuery } from "@/features/events/hooks/use-organizer-event-details-query";
import { usePublishEventMutation } from "@/features/events/hooks/use-publish-event-mutation";
import { useUpdateEventMutation } from "@/features/events/hooks/use-update-event-mutation";
import { ROUTES } from "@/lib/constants/routes";

export default function OrganizerEventDetailsPage() {
  const router = useRouter();
  const params = useParams<{ eventId: string }>();
  const { data, isLoading, isError, error } = useOrganizerEventDetailsQuery(
    params.eventId
  );
  const mutation = useUpdateEventMutation(params.eventId);
  const publishMutation = usePublishEventMutation();
  const deleteMutation = useDeleteEventMutation();

  async function handlePublish() {
    await publishMutation.mutateAsync(params.eventId);
  }

  async function handleDelete() {
    await deleteMutation.mutateAsync(params.eventId);
    router.push("/organizer/events");
  }

  return (
    <div className="grid gap-6">
      <PageTitle
        eyebrow="Organizer"
        title="Edit event"
        description="Update event details, prepare your draft, and publish when everything is ready."
      />
      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Card className="grid gap-3">
          <h2 className="text-xl font-semibold text-ink">Could not load event</h2>
          <p className="text-sm text-slate-600">{error.message}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={ROUTES.organizerEvents}>
              <Button variant="ghost">Back to organizer events</Button>
            </Link>
            <Link href={ROUTES.organizerNewEvent}>
              <Button>Create new event</Button>
            </Link>
          </div>
        </Card>
      ) : !data || !data.id ? (
        <Card className="grid gap-3">
          <h2 className="text-xl font-semibold text-ink">Event unavailable</h2>
          <p className="text-sm text-slate-600">
            This organizer event could not be found or is no longer available in the draft workspace.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={ROUTES.organizerEvents}>
              <Button variant="ghost">Back to organizer events</Button>
            </Link>
            <Link href={ROUTES.organizerNewEvent}>
              <Button>Create new event</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid gap-1">
              <p className="text-sm font-medium text-ink">Draft actions</p>
              <p className="text-sm text-slate-600">
                Publish this draft to the public catalog or delete it if it is no longer needed.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/organizer/events/${params.eventId}/registrations`}>
                <Button type="button" variant="ghost">
                  View registrations
                </Button>
              </Link>
              <Button
                type="button"
                variant="secondary"
                onClick={handlePublish}
                disabled={publishMutation.isPending || data.status !== "DRAFT"}
              >
                {publishMutation.isPending ? "Publishing..." : "Publish"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleDelete}
                disabled={deleteMutation.isPending || data.status !== "DRAFT"}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete draft"}
              </Button>
            </div>
          </Card>
          <EventForm
            defaultValues={data}
            submitLabel={mutation.isPending ? "Updating..." : "Update event"}
            onSubmit={async (values) => mutation.mutateAsync(values)}
          />
        </>
      )}
    </div>
  );
}
