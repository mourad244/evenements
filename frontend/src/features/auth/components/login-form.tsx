"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants/routes";

import { loginSchema, type LoginSchema } from "../schemas/auth.schema";
import { useLoginMutation } from "../hooks/use-login-mutation";
import { PasswordField } from "./password-field";

export function LoginForm() {
  const router = useRouter();
  const mutation = useLoginMutation();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const session = await mutation.mutateAsync(values);
    if (session.user.role === "ADMIN") {
      router.push(ROUTES.adminEvents);
      return;
    }
    if (session.user.role === "ORGANIZER") {
      router.push(ROUTES.organizerEvents);
      return;
    }
    router.push(ROUTES.dashboard);
  });

  return (
    <Card className="mx-auto grid w-full max-w-xl gap-7 border-[rgba(88,116,255,0.2)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.16),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_30px_68px_rgba(14,24,54,0.32)]">
      <div className="grid gap-2.5 border-b border-[var(--line-soft)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
          Account access
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
          Welcome back
        </h2>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Sign in to access your participant, organizer, or admin workspace.
        </p>
      </div>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Input
          id="login-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...form.register("email")}
          error={form.formState.errors.email?.message}
          disabled={mutation.isPending}
        />
        <PasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          {...form.register("password")}
          error={form.formState.errors.password?.message}
          disabled={mutation.isPending}
        />
        {mutation.isPending ? (
          <p role="status" className="rounded-[22px] border border-[rgba(88,116,255,0.18)] bg-[rgba(88,116,255,0.08)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            Signing you in and opening your workspace...
          </p>
        ) : null}
        {mutation.error ? (
          <p role="alert" className="rounded-[22px] border border-[rgba(251,113,133,0.24)] bg-[rgba(127,29,29,0.26)] px-4 py-3 text-sm text-[var(--status-danger)]">
            {mutation.error.message}
          </p>
        ) : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="flex flex-col gap-2 border-t border-[var(--line-soft)] pt-5 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between">
        <Link href={ROUTES.forgotPassword} className="font-semibold text-[var(--accent-primary-strong)] hover:text-[var(--text-primary)]">
          Forgot password?
        </Link>
        <p>
          New here?{" "}
          <Link href={ROUTES.register} className="font-semibold text-[var(--accent-primary-strong)] hover:text-[var(--text-primary)]">
            Create an account
          </Link>
        </p>
      </div>
    </Card>
  );
}
