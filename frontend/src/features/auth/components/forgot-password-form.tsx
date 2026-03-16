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
    <Card className="mx-auto grid w-full max-w-xl gap-6">
      <div className="grid gap-2">
        <h2 className="text-2xl font-semibold text-ink">Forgot your password?</h2>
        <p className="text-sm text-slate-600">
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
          <p role="status" className="text-sm text-slate-600">
            Sending reset instructions...
          </p>
        ) : null}
        {mutation.isSuccess ? (
          <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            If the account exists, reset instructions have been sent.
          </p>
        ) : null}
        {mutation.error ? (
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
      <p className="text-sm text-slate-600">
        Remembered it?{" "}
        <Link href={ROUTES.login} className="font-semibold text-brand-700 hover:text-brand-800">
          Back to sign in
        </Link>
      </p>
    </Card>
  );
}
