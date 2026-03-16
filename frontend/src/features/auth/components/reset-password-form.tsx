"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants/routes";

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

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    router.push(ROUTES.login);
  });

  return (
    <Card className="mx-auto grid w-full max-w-xl gap-6">
      <div className="grid gap-2">
        <h2 className="text-2xl font-semibold text-ink">Reset your password</h2>
        <p className="text-sm text-slate-600">
          Paste your reset token and choose a new password to regain access.
        </p>
      </div>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Input
          id="reset-password-token"
          label="Reset token"
          placeholder="Paste your token"
          {...form.register("token")}
          error={form.formState.errors.token?.message}
          disabled={mutation.isPending}
        />
        <PasswordField
          id="reset-password"
          label="New password"
          autoComplete="new-password"
          placeholder="Choose a new password"
          {...form.register("password")}
          error={form.formState.errors.password?.message}
          disabled={mutation.isPending}
        />
        <PasswordField
          id="reset-password-confirm"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Repeat your new password"
          {...form.register("confirmPassword")}
          error={form.formState.errors.confirmPassword?.message}
          disabled={mutation.isPending}
        />
        {mutation.isPending ? (
          <p role="status" className="text-sm text-slate-600">
            Resetting your password. You will return to sign in once this is complete.
          </p>
        ) : null}
        {mutation.error ? (
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {mutation.error.message}
          </p>
        ) : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Resetting..." : "Reset password"}
        </Button>
      </form>
      <p className="text-sm text-slate-600">
        Back to{" "}
        <Link href={ROUTES.login} className="font-semibold text-brand-700 hover:text-brand-800">
          sign in
        </Link>
      </p>
    </Card>
  );
}
