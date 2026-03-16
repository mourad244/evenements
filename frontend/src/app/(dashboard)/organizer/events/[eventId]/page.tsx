"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useState } from "react";

import { PageTitle } from "@/components/shared/page-title";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { UnavailableState } from "@/components/ui/unavailable-state";
import { EventForm } from "@/features/events/components/event-form";
import { useDeleteEventMutation } from "@/features/events/hooks/use-delete-event-mutation";
import { useOrganizerEventDetailsQuery } from "@/features/events/hooks/use-organizer-event-details-query";
import { usePublishEventMutation } from "@/features/events/hooks/use-publish-event-mutation";
import { useUpdateEventMutation } from "@/features/events/hooks/use-update-event-mutation";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format-date";

function getStateSummary(status: "DRAFT" | "PUBLISHED" | "CANCELLED") {
  if (status === "DRAFT") {
    return {
      title: "Draft event",
      description:
        "This event is still being prepared. You can continue refining the details, publish it, or remove the draft if plans change."
    };
  }

  if (status === "PUBLISHED") {
    return {
      title: "Published event",
      description:
        "This event is already live. You can keep the details up to date and move into registrations when you need participant visibility."
    };
  }

  return {
    title: "Cancelled event",
    description:
      "This event is no longer active. You can still review its details from the organizer workspace."
  };
}

export default function OrganizerEventDetailsPage() {
  const router = useRouter();
  const params = useParams<{ eventId: string }>();
  const { data, isLoading, isError, error } = useOrganizerEventDetailsQuery(
    params.eventId
  );
  const mutation = useUpdateEventMutation(params.eventId);
  const publishMutation = usePublishEventMutation();
  const deleteMutation = useDeleteEventMutation();
  const [actionFeedback, setActionFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  async function handlePublish() {
    setActionFeedback(null);
    try {
      await publishMutation.mutateAsync(params.eventId);
      setActionFeedback({
        tone: "success",
        message: "Your event was published successfully."
      });
    } catch (error) {
      setActionFeedback({
        tone: "error",
        message:
          error instanceof Error ? error.message : "Could not publish this event right now."
      });
    }
  }

  async function handleDelete() {
    setActionFeedback(null);
    try {
      await deleteMutation.mutateAsync(params.eventId);
      router.push("/organizer/events");
    } catch (error) {
      setActionFeedback({
        tone: "error",
        message:
          error instanceof Error ? error.message : "Could not delete this draft right now."
      });
    }
  }

  return (
    <div className="grid gap-8">
      <PageTitle
        eyebrow="Organizer"
        title="Edit event"
        description="Update event details, prepare your draft, and publish when everything is ready."
      />
      {isLoading ? (
        <LoadingState label="Loading event..." />
      ) : isError ? (
        <ErrorState
          title="Could not load event"
          description={error.message}
          action={
            <>
              <Link href={ROUTES.organizerEvents}>
                <Button variant="ghost">Back to organizer events</Button>
              </Link>
              <Link href={ROUTES.organizerNewEvent}>
                <Button>Create new event</Button>
              </Link>
            </>
          }
        />
      ) : !data || !data.id ? (
        <UnavailableState
          title="Event unavailable"
          description="This event could not be found or is no longer available."
          action={
            <>
              <Link href={ROUTES.organizerEvents}>
                <Button variant="ghost">Back to organizer events</Button>
              </Link>
              <Link href={ROUTES.organizerNewEvent}>
                <Button>Create new event</Button>
              </Link>
            </>
          }
        />
      ) : (
        <>
          <Card className="grid gap-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={data.status} />
                  <p className="text-sm text-slate-500">
                    {data.startAt ? `Starts ${formatDate(data.startAt)}` : "Start date pending"}
                  </p>
                </div>
                <div className="grid gap-1">
                  <h2 className="text-xl font-semibold text-ink">{getStateSummary(data.status).title}</h2>
                  <p className="text-sm text-slate-600">{getStateSummary(data.status).description}</p>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                  <p>{data.city}</p>
                  <p>{data.venue}</p>
                  <p>{data.capacity} seats</p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap xl:justify-end">
                <Link href={`/organizer/events/${params.eventId}/registrations`} className="w-full sm:w-auto">
                  <Button type="button" variant="ghost" className="w-full sm:w-auto">
                    View registrations
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePublish}
                  disabled={
                    publishMutation.isPending ||
                    deleteMutation.isPending ||
                    mutation.isPending ||
                    data.status !== "DRAFT"
                  }
                  className="w-full sm:w-auto"
                >
                  {publishMutation.isPending ? "Publishing..." : "Publish"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={
                    deleteMutation.isPending ||
                    publishMutation.isPending ||
                    mutation.isPending ||
                    data.status !== "DRAFT"
                  }
                  className="w-full sm:w-auto"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Delete draft"}
                </Button>
              </div>
            </div>
          </Card>

          {publishMutation.isPending || deleteMutation.isPending || mutation.isPending || actionFeedback ? (
            <Card className="grid gap-3">
              <p className="text-sm font-medium text-ink">Organizer updates</p>
              {mutation.isPending ? (
                <p role="status" className="text-sm text-slate-600">
                  Saving your event changes...
                </p>
              ) : null}
              {publishMutation.isPending ? (
                <p role="status" className="text-sm text-slate-600">
                  Publishing your event...
                </p>
              ) : null}
              {deleteMutation.isPending ? (
                <p role="status" className="text-sm text-slate-600">
                  Deleting this draft and returning to your organizer events...
                </p>
              ) : null}
              {actionFeedback ? (
                <p
                  role={actionFeedback.tone === "error" ? "alert" : "status"}
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    actionFeedback.tone === "success"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {actionFeedback.message}
                </p>
              ) : null}
            </Card>
          ) : null}

          <EventForm
            defaultValues={data}
            submitLabel={mutation.isPending ? "Updating..." : "Update event"}
            submitDisabled={
              mutation.isPending || publishMutation.isPending || deleteMutation.isPending
            }
            onSubmit={async (values) => {
              setActionFeedback(null);
              try {
                await mutation.mutateAsync(values);
                setActionFeedback({
                  tone: "success",
                  message: "Your event details were saved."
                });
              } catch (error) {
                setActionFeedback({
                  tone: "error",
                  message:
                    error instanceof Error
                      ? error.message
                      : "Could not save your event changes right now."
                });
              }
            }}
          />
        </>
      )}
    </div>
  );
}
