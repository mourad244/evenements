"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants/routes";

import {
  forgotPasswordSchema,
  type ForgotPasswordSchema
} from "../schemas/auth.schema";
import { useForgotPasswordMutation } from "../hooks/use-forgot-password-mutation";

export function ForgotPasswordForm() {
  const mutation = useForgotPasswordMutation();
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
  });

  return (
    <Card className="mx-auto grid w-full max-w-xl gap-7 border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.14),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_30px_68px_rgba(0,0,0,0.32)]">
      <div className="grid gap-2.5 border-b border-[var(--line-soft)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-warm)]">
          Recovery
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
          Forgot your password?
        </h2>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Enter your email and we will trigger the password reset flow.
        </p>
      </div>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Input
          id="forgot-password-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...form.register("email")}
          error={form.formState.errors.email?.message}
          disabled={mutation.isPending || mutation.isSuccess}
        />
        {mutation.isPending ? (
          <p role="status" className="rounded-[22px] border border-[rgba(88,116,255,0.18)] bg-[rgba(88,116,255,0.08)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            Sending reset instructions...
          </p>
        ) : null}
        {mutation.isSuccess ? (
          <p role="status" className="rounded-[22px] border border-[rgba(52,211,153,0.22)] bg-[rgba(6,78,59,0.3)] px-4 py-3 text-sm text-[var(--status-success)]">
            If the account exists, reset instructions have been sent.
          </p>
        ) : null}
        {mutation.error ? (
          <p role="alert" className="rounded-[22px] border border-[rgba(251,113,133,0.24)] bg-[rgba(127,29,29,0.26)] px-4 py-3 text-sm text-[var(--status-danger)]">
            {mutation.error.message}
          </p>
        ) : null}
        <Button type="submit" disabled={mutation.isPending || mutation.isSuccess}>
          {mutation.isPending
            ? "Sending..."
            : mutation.isSuccess
              ? "Instructions sent"
              : "Send reset instructions"}
        </Button>
      </form>
      <p className="border-t border-[var(--line-soft)] pt-5 text-sm text-[var(--text-secondary)]">
        Remembered it?{" "}
        <Link href={ROUTES.login} className="font-semibold text-[var(--accent-primary-strong)] hover:text-[var(--text-primary)]">
          Back to sign in
        </Link>
      </p>
    </Card>
  );
}
