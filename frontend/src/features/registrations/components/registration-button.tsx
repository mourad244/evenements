"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { getToken } from "@/lib/auth/get-token";

import { useRegisterToEventMutation } from "../hooks/use-register-to-event-mutation";

type FeedbackTone = "success" | "error" | "info";

export function RegistrationButton({ eventId }: { eventId: string }) {
  const mutation = useRegisterToEventMutation();
  const [message, setMessage] = useState<{ tone: FeedbackTone; text: string } | null>(null);
  const isAuthenticated = Boolean(getToken());

  if (!isAuthenticated) {
    return (
      <div className="grid gap-3">
        <Link href={ROUTES.login} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">Sign in to register</Button>
        </Link>
        <Link href={ROUTES.register} className="w-full sm:w-auto">
          <Button variant="ghost" className="w-full sm:w-auto">
            Create an account
          </Button>
        </Link>
        <p className="text-xs text-[var(--text-muted)]">
          You need a participant account to complete registration.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <Button
        onClick={async () => {
          setMessage(null);
          try {
            await mutation.mutateAsync({ eventId });
            setMessage({
              tone: "success",
              text: "Registration request submitted. Check your participant history for status updates."
            });
          } catch (error) {
            const text =
              error instanceof Error ? error.message : "Could not register for this event.";
            setMessage({ tone: "error", text });
          }
        }}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Registering..." : "Register for event"}
      </Button>
      {message ? (
        <p
          className={`text-sm ${
            message.tone === "success"
              ? "text-[var(--status-success)]"
              : message.tone === "error"
                ? "text-[var(--status-danger)]"
                : "text-[var(--text-secondary)]"
          }`}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}
