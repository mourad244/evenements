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
    <Card className="mx-auto grid w-full max-w-xl gap-6">
      <div className="grid gap-2">
        <h2 className="text-2xl font-semibold text-ink">Welcome back</h2>
        <p className="text-sm text-slate-600">
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
        />
        <PasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          {...form.register("password")}
          error={form.formState.errors.password?.message}
        />
        {mutation.error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {mutation.error.message}
          </p>
        ) : null}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <Link href={ROUTES.forgotPassword} className="font-semibold text-brand-700 hover:text-brand-800">
          Forgot password?
        </Link>
        <p>
          New here?{" "}
          <Link href={ROUTES.register} className="font-semibold text-brand-700 hover:text-brand-800">
            Create an account
          </Link>
        </p>
      </div>
    </Card>
  );
}
