"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { eventSchema, type EventSchema } from "../schemas/event.schema";
import type { UpsertEventInput } from "../types/event.types";

type EventFormProps = {
  defaultValues?: Partial<UpsertEventInput>;
  submitLabel?: string;
  submitDisabled?: boolean;
  onSubmit: (values: UpsertEventInput) => Promise<unknown> | void;
};

export function EventForm({
  defaultValues,
  submitLabel = "Save event",
  submitDisabled = false,
  onSubmit
}: EventFormProps) {
  const form = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      city: defaultValues?.city || "",
      venue: defaultValues?.venue || "",
      startAt: defaultValues?.startAt || "",
      endAt: defaultValues?.endAt || "",
      price: defaultValues?.price || 0,
      currency: defaultValues?.currency || "MAD",
      capacity: defaultValues?.capacity || 100,
      theme: defaultValues?.theme || "",
      imageUrl: defaultValues?.imageUrl || ""
    }
  });

  return (
    <Card>
      <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(async (values) => onSubmit(values))}>
        <div className="md:col-span-2">
          <Input
            label="Title"
            {...form.register("title")}
            error={form.formState.errors.title?.message}
            disabled={submitDisabled}
          />
        </div>
        <div className="md:col-span-2">
          <label className="grid gap-2 text-sm text-slate-700">
            <span className="font-medium">Description</span>
            <textarea
              className="min-h-36 rounded-3xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
              {...form.register("description")}
              disabled={submitDisabled}
            />
            {form.formState.errors.description?.message ? <span className="text-xs text-red-600">{form.formState.errors.description.message}</span> : null}
          </label>
        </div>
        <Input label="City" {...form.register("city")} error={form.formState.errors.city?.message} disabled={submitDisabled} />
        <Input label="Venue" {...form.register("venue")} error={form.formState.errors.venue?.message} disabled={submitDisabled} />
        <Input label="Start at" type="datetime-local" {...form.register("startAt")} error={form.formState.errors.startAt?.message} disabled={submitDisabled} />
        <Input label="End at" type="datetime-local" {...form.register("endAt")} error={form.formState.errors.endAt?.message} disabled={submitDisabled} />
        <Input label="Price" type="number" step="0.01" {...form.register("price")} error={form.formState.errors.price?.message} disabled={submitDisabled} />
        <Input label="Currency" {...form.register("currency")} error={form.formState.errors.currency?.message} disabled={submitDisabled} />
        <Input label="Capacity" type="number" {...form.register("capacity")} error={form.formState.errors.capacity?.message} disabled={submitDisabled} />
        <Input label="Theme" {...form.register("theme")} error={form.formState.errors.theme?.message} disabled={submitDisabled} />
        <div className="md:col-span-2">
          <Input
            label="Featured image path"
            hint="Use a public path such as /images/event-media-demo.svg."
            placeholder="/images/event-media-demo.svg"
            {...form.register("imageUrl")}
            error={form.formState.errors.imageUrl?.message}
            disabled={submitDisabled}
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={submitDisabled}>{submitLabel}</Button>
        </div>
      </form>
    </Card>
  );
}
