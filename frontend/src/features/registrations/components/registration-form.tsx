"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { registrationSchema } from "../schemas/registration.schema";
import { useRegisterToEventMutation } from "../hooks/use-register-to-event-mutation";

export function RegistrationForm({ eventId }: { eventId: string }) {
  const mutation = useRegisterToEventMutation();
  const form = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: { eventId }
  });

  return (
    <Card className="max-w-xl">
      <form className="grid gap-4" onSubmit={form.handleSubmit(async (values) => mutation.mutateAsync(values))}>
        <Input label="Event ID" {...form.register("eventId")} error={form.formState.errors.eventId?.message} />
        {mutation.error ? <p className="text-sm text-red-600">{mutation.error.message}</p> : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Submitting..." : "Join event"}
        </Button>
      </form>
    </Card>
  );
}
