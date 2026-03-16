"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/constants/routes";

import { registerSchema, type RegisterSchema } from "../schemas/auth.schema";
import { useRegisterMutation } from "../hooks/use-register-mutation";
import { PasswordField } from "./password-field";

export function RegisterForm() {
  const router = useRouter();
  const mutation = useRegisterMutation();
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "PARTICIPANT"
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    router.push(ROUTES.login);
  });

  return (
    <Card className="mx-auto grid w-full max-w-xl gap-7 border-[rgba(88,116,255,0.18)] bg-[radial-gradient(circle_at_top_right,rgba(88,116,255,0.14),transparent_30%),linear-gradient(180deg,rgba(18,28,46,0.96),rgba(9,15,26,0.98))] shadow-[0_30px_68px_rgba(14,24,54,0.32)]">
      <div className="grid gap-2.5 border-b border-[var(--line-soft)] pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent-primary-strong)]">
          Create account
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
          Create your account
        </h2>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">
          Start as a participant or organizer and connect to the platform securely.
        </p>
      </div>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <Input
          id="register-full-name"
          label="Full name"
          autoComplete="name"
          placeholder="Your full name"
          {...form.register("fullName")}
          error={form.formState.errors.fullName?.message}
          disabled={mutation.isPending}
        />
        <Input
          id="register-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...form.register("email")}
          error={form.formState.errors.email?.message}
          disabled={mutation.isPending}
        />
        <PasswordField
          id="register-password"
          label="Password"
          autoComplete="new-password"
          placeholder="Choose a strong password"
          {...form.register("password")}
          error={form.formState.errors.password?.message}
          disabled={mutation.isPending}
        />
        <PasswordField
          id="register-confirm-password"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          {...form.register("confirmPassword")}
          error={form.formState.errors.confirmPassword?.message}
          disabled={mutation.isPending}
        />
        <label className="grid gap-2.5 text-sm text-[var(--text-secondary)]">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Role
          </span>
          <select
            className="h-12 rounded-[22px] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(16,26,45,0.96),rgba(10,17,30,0.98))] px-4 text-sm text-[var(--text-primary)] outline-none transition shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus-visible:border-[rgba(88,116,255,0.38)] focus-visible:ring-2 focus-visible:ring-[var(--ring-brand)]"
            {...form.register("role")}
            disabled={mutation.isPending}
          >
            <option value="PARTICIPANT">Participant</option>
            <option value="ORGANIZER">Organizer</option>
          </select>
        </label>
        {mutation.isPending ? (
          <p role="status" className="rounded-[22px] border border-[rgba(88,116,255,0.18)] bg-[rgba(88,116,255,0.08)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            Creating your account. You will be redirected to sign in next.
          </p>
        ) : null}
        {mutation.error ? (
          <p role="alert" className="rounded-[22px] border border-[rgba(251,113,133,0.24)] bg-[rgba(127,29,29,0.26)] px-4 py-3 text-sm text-[var(--status-danger)]">
            {mutation.error.message}
          </p>
        ) : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="border-t border-[var(--line-soft)] pt-5 text-sm text-[var(--text-secondary)]">
        Already have an account?{" "}
        <Link href={ROUTES.login} className="font-semibold text-[var(--accent-primary-strong)] hover:text-[var(--text-primary)]">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
