"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { useRegisterToEventMutation } from "../hooks/use-register-to-event-mutation";

export function RegistrationButton({ eventId }: { eventId: string }) {
  const mutation = useRegisterToEventMutation();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="grid gap-3">
      <Button
        onClick={async () => {
          await mutation.mutateAsync({ eventId });
          setMessage("Registration request submitted.");
        }}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Registering..." : "Register for event"}
      </Button>
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
    </div>
  );
}
