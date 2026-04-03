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
  submitError?: string | null;
  onSubmit: (values: UpsertEventInput) => Promise<unknown> | void;
};

export function EventForm({
  defaultValues,
  submitLabel = "Save event",
  submitDisabled = false,
  submitError,
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
      theme: defaultValues?.theme || ""
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
          <label className="grid gap-2.5 text-sm text-[var(--text-secondary)]">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Description
            </span>
            <textarea
              className="min-h-36 rounded-[22px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.96),rgba(10,17,30,0.98))] px-4 py-3 text-sm text-[var(--text-primary)] outline-none ring-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition placeholder:text-[var(--text-muted)] focus-visible:border-[rgba(88,116,255,0.38)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)] disabled:cursor-not-allowed disabled:opacity-60"
              {...form.register("description")}
              disabled={submitDisabled}
            />
            {form.formState.errors.description?.message ? (
              <span className="text-xs text-[var(--status-danger)]">
                {form.formState.errors.description.message}
              </span>
            ) : null}
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
        <div className="md:col-span-2 grid gap-3">
          {submitError ? (
            <p
              role="alert"
              className="rounded-[22px] border border-[rgba(251,113,133,0.24)] bg-[rgba(127,29,29,0.26)] px-4 py-3 text-sm text-[var(--status-danger)]"
            >
              {submitError}
            </p>
          ) : null}
          <Button type="submit" disabled={submitDisabled}>{submitLabel}</Button>
        </div>
      </form>
    </Card>
  );
}
