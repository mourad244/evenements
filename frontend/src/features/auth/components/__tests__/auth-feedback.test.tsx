// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";

type MutationState<T = unknown> = {
  mutateAsync: (values: T) => Promise<unknown>;
  isPending: boolean;
  isSuccess?: boolean;
  error: Error | null;
};

const routerState = {
  pushes: [] as string[]
};

const searchParamsState = {
  params: new URLSearchParams("")
};

const loginMutationState: MutationState = {
  mutateAsync: async () => ({ user: { role: "PARTICIPANT" } }),
  isPending: false,
  error: null
};

const registerMutationState: MutationState = {
  mutateAsync: async () => undefined,
  isPending: false,
  error: null
};

const forgotPasswordMutationState: MutationState = {
  mutateAsync: async () => undefined,
  isPending: false,
  isSuccess: false,
  error: null
};

const resetPasswordMutationState: MutationState = {
  mutateAsync: async () => undefined,
  isPending: false,
  error: null
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: (href: string) => routerState.pushes.push(href)
  }),
  useSearchParams: () => searchParamsState.params
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) =>
    React.createElement("a", { href: String(href), ...props }, children)
}));

vi.mock("@/features/auth/hooks/use-login-mutation", () => ({
  useLoginMutation: () => loginMutationState
}));

vi.mock("@/features/auth/hooks/use-register-mutation", () => ({
  useRegisterMutation: () => registerMutationState
}));

vi.mock("@/features/auth/hooks/use-forgot-password-mutation", () => ({
  useForgotPasswordMutation: () => forgotPasswordMutationState
}));

vi.mock("@/features/auth/hooks/use-reset-password-mutation", () => ({
  useResetPasswordMutation: () => resetPasswordMutationState
}));

import { ForgotPasswordForm } from "../forgot-password-form";
import { LoginForm } from "../login-form";
import { RegisterForm } from "../register-form";
import { ResetPasswordForm } from "../reset-password-form";

describe("auth action feedback", () => {
  afterEach(() => {
    cleanup();
    routerState.pushes = [];
    searchParamsState.params = new URLSearchParams("");

    loginMutationState.isPending = false;
    loginMutationState.error = null;

    registerMutationState.isPending = false;
    registerMutationState.error = null;

    forgotPasswordMutationState.isPending = false;
    forgotPasswordMutationState.isSuccess = false;
    forgotPasswordMutationState.error = null;

    resetPasswordMutationState.isPending = false;
    resetPasswordMutationState.error = null;
  });

  it("shows login pending feedback and disables controls", () => {
    loginMutationState.isPending = true;

    render(<LoginForm />);

    expect(screen.getByText("Signing you in and opening your workspace...")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Signing in..." }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByLabelText("Email").hasAttribute("disabled")).toBe(true);
    expect(screen.getByLabelText("Password").hasAttribute("disabled")).toBe(true);
  });

  it("shows login inline error feedback", () => {
    loginMutationState.error = new Error("Invalid credentials");

    render(<LoginForm />);

    expect(screen.getByRole("alert").textContent).toContain("Invalid credentials");
  });

  it("shows register pending feedback and inline error feedback", () => {
    registerMutationState.isPending = true;

    const { rerender } = render(<RegisterForm />);

    expect(
      screen.getByText("Creating your account. You will be redirected to sign in next.")
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Creating account..." }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByLabelText("Full name").hasAttribute("disabled")).toBe(true);

    registerMutationState.isPending = false;
    registerMutationState.error = new Error("Email already in use");
    rerender(<RegisterForm />);

    expect(screen.getByRole("alert").textContent).toContain("Email already in use");
  });

  it("shows forgot-password success feedback and disables submit after success", () => {
    forgotPasswordMutationState.isSuccess = true;

    render(<ForgotPasswordForm />);

    expect(
      screen.getByText("If the account exists, reset instructions have been sent.")
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Instructions sent" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByLabelText("Email").hasAttribute("disabled")).toBe(true);
  });

  it("shows reset-password pending and inline error feedback", () => {
    searchParamsState.params = new URLSearchParams("token=abc123");
    resetPasswordMutationState.isPending = true;

    const { rerender } = render(<ResetPasswordForm />);

    expect(
      screen.getByText("Resetting your password. You will return to sign in once this is complete.")
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Resetting..." }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByLabelText("Reset token").hasAttribute("disabled")).toBe(true);

    resetPasswordMutationState.isPending = false;
    resetPasswordMutationState.error = new Error("Reset token expired");
    rerender(<ResetPasswordForm />);

    expect(screen.getByRole("alert").textContent).toContain("Reset token expired");
  });
});
