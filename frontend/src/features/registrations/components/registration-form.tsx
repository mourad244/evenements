"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormErrorSummary } from "@/components/shared/form-error-summary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  focusFirstErrorField,
  getFieldErrorMessages
} from "@/lib/forms/form-accessibility";

import { registrationSchema } from "../schemas/registration.schema";
import { useRegisterToEventMutation } from "../hooks/use-register-to-event-mutation";

export function RegistrationForm({ eventId }: { eventId: string }) {
  const mutation = useRegisterToEventMutation();
  const form = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: { eventId }
  });
  const validationMessages = getFieldErrorMessages(form.formState.errors);

  return (
    <Card className="max-w-xl">
      <form
        className="grid gap-4"
        noValidate
        aria-busy={mutation.isPending}
        onSubmit={form.handleSubmit(
          async (values) => mutation.mutateAsync(values),
          (errors) => {
            focusFirstErrorField(["eventId"] as const, errors, form.setFocus);
          }
        )}
      >
        <FormErrorSummary title="Fix the registration form" messages={validationMessages} />
        <Input
          label="Event ID"
          hint="Paste the event identifier from the public event page."
          {...form.register("eventId")}
          error={form.formState.errors.eventId?.message}
          disabled={mutation.isPending}
        />
        {mutation.error ? (
          <p role="alert" className="text-sm text-red-600">
            {mutation.error.message}
          </p>
        ) : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Submitting..." : "Join event"}
        </Button>
      </form>
    </Card>
  );
}
