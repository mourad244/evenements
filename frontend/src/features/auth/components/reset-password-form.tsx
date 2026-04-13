"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormErrorSummary } from "@/components/shared/form-error-summary";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants/routes";
import {
  focusFirstErrorField,
  getFieldErrorMessages
} from "@/lib/forms/form-accessibility";

import { useResetPasswordMutation } from "../hooks/use-reset-password-mutation";
import { PasswordField } from "./password-field";
import {
  resetPasswordSchema,
  type ResetPasswordSchema
} from "../schemas/auth.schema";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mutation = useResetPasswordMutation();
  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: "",
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    const token = searchParams.get("token") || "";
    if (token) {
      form.setValue("token", token, { shouldValidate: true });
    }
  }, [form, searchParams]);

  const onSubmit = form.handleSubmit(
    async (values) => {
      await mutation.mutateAsync(values);
      router.push(ROUTES.login);
    },
    (errors) => {
      focusFirstErrorField(
        ["token", "password", "confirmPassword"] as const,
        errors,
        form.setFocus
      );
    }
  );
  const validationMessages = getFieldErrorMessages(form.formState.errors);

  return (
    <Card className="mx-auto grid w-full max-w-xl gap-7 border-[rgba(243,154,99,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(243,154,99,0.14),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_30px_68px_rgba(0,0,0,0.32)]">
      <div className="grid gap-2.5 border-b border-[var(--line-soft)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-warm)]">
          Recovery
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
          Reset your password
        </h2>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Paste your reset token and choose a new password to regain access.
        </p>
      </div>
      <form className="grid gap-4" onSubmit={onSubmit} noValidate aria-busy={mutation.isPending}>
        <FormErrorSummary title="Fix the password reset form" messages={validationMessages} />
        <Input
          id="reset-password-token"
          label="Reset token"
          hint="Use the token from the password reset email."
          placeholder="Paste your token"
          {...form.register("token")}
          error={form.formState.errors.token?.message}
          disabled={mutation.isPending}
        />
        <PasswordField
          id="reset-password"
          label="New password"
          hint="Choose a new password with upper and lower case letters and a number."
          autoComplete="new-password"
          placeholder="Choose a new password"
          {...form.register("password")}
          error={form.formState.errors.password?.message}
          disabled={mutation.isPending}
        />
        <PasswordField
          id="reset-password-confirm"
          label="Confirm password"
          hint="Repeat the new password to make sure it matches."
          autoComplete="new-password"
          placeholder="Repeat your new password"
          {...form.register("confirmPassword")}
          error={form.formState.errors.confirmPassword?.message}
          disabled={mutation.isPending}
        />
        {mutation.isPending ? (
          <p role="status" className="rounded-[22px] border border-[rgba(88,116,255,0.18)] bg-[rgba(88,116,255,0.08)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            Resetting your password. You will return to sign in once this is complete.
          </p>
        ) : null}
        {mutation.error ? (
          <p role="alert" className="rounded-[22px] border border-[rgba(251,113,133,0.24)] bg-[rgba(127,29,29,0.26)] px-4 py-3 text-sm text-[var(--status-danger)]">
            {mutation.error.message}
          </p>
        ) : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Resetting..." : "Reset password"}
        </Button>
      </form>
      <p className="border-t border-[var(--line-soft)] pt-5 text-sm text-[var(--text-secondary)]">
        Back to{" "}
        <Link href={ROUTES.login} className="font-semibold text-[var(--accent-primary-strong)] hover:text-[var(--text-primary)]">
          sign in
        </Link>
      </p>
    </Card>
  );
}
