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
    <Card className="mx-auto grid w-full max-w-xl gap-6">
      <div className="grid gap-2">
        <h2 className="text-2xl font-semibold text-ink">Create your account</h2>
        <p className="text-sm text-slate-600">
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
        />
        <Input
          id="register-email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...form.register("email")}
          error={form.formState.errors.email?.message}
        />
        <PasswordField
          id="register-password"
          label="Password"
          autoComplete="new-password"
          placeholder="Choose a strong password"
          {...form.register("password")}
          error={form.formState.errors.password?.message}
        />
        <PasswordField
          id="register-confirm-password"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          {...form.register("confirmPassword")}
          error={form.formState.errors.confirmPassword?.message}
        />
        <label className="grid gap-2 text-sm text-slate-700">
          <span className="font-medium">Role</span>
          <select
            className="h-11 rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            {...form.register("role")}
          >
            <option value="PARTICIPANT">Participant</option>
            <option value="ORGANIZER">Organizer</option>
          </select>
        </label>
        {mutation.error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {mutation.error.message}
          </p>
        ) : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link href={ROUTES.login} className="font-semibold text-brand-700 hover:text-brand-800">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
