import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

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

function render(element: React.ReactElement) {
  return renderToStaticMarkup(element);
}

describe("auth forms", () => {
  beforeEach(() => {
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

  it("LoginForm renders fields and recovery links", () => {
    const html = render(<LoginForm />);

    expect(html).toContain("Welcome back");
    expect(html).toContain('type="email"');
    expect(html).toContain("Enter your password");
    expect(html).toContain("Forgot password?");
    expect(html).toContain("Create an account");
  });

  it("LoginForm renders pending feedback and disables controls while submitting", () => {
    loginMutationState.isPending = true;

    const html = render(<LoginForm />);

    expect(html).toContain("Signing you in and opening your workspace...");
    expect(html).toContain("Signing in...");
    expect((html.match(/disabled=""/g) || []).length).toBeGreaterThanOrEqual(3);
  });

  it("LoginForm renders inline mutation errors", () => {
    loginMutationState.error = new Error("Invalid credentials");

    const html = render(<LoginForm />);

    expect(html).toContain('role="alert"');
    expect(html).toContain("Invalid credentials");
  });

  it("RegisterForm renders expected fields and role selection", () => {
    const html = render(<RegisterForm />);

    expect(html).toContain("Create your account");
    expect(html).toContain("Full name");
    expect(html).toContain("Confirm password");
    expect(html).toContain('option value="PARTICIPANT"');
    expect(html).toContain("Sign in");
  });

  it("RegisterForm renders pending feedback and disables inputs while submitting", () => {
    registerMutationState.isPending = true;

    const html = render(<RegisterForm />);

    expect(html).toContain("Creating your account. You will be redirected to sign in next.");
    expect(html).toContain("Creating account...");
    expect((html.match(/disabled=""/g) || []).length).toBeGreaterThanOrEqual(5);
  });

  it("ForgotPasswordForm renders success feedback and disabled submit after success", () => {
    forgotPasswordMutationState.isSuccess = true;

    const html = render(<ForgotPasswordForm />);

    expect(html).toContain("If the account exists, reset instructions have been sent.");
    expect(html).toContain("Instructions sent");
    expect((html.match(/disabled=""/g) || []).length).toBeGreaterThanOrEqual(2);
  });

  it("ResetPasswordForm renders token and password fields with pending and error feedback", () => {
    searchParamsState.params = new URLSearchParams("token=abc123");
    resetPasswordMutationState.isPending = true;
    resetPasswordMutationState.error = new Error("Reset token expired");

    const html = render(<ResetPasswordForm />);

    expect(html).toContain("Reset your password");
    expect(html).toContain("Reset token");
    expect(html).toContain(
      "Resetting your password. You will return to sign in once this is complete."
    );
    expect(html).toContain("Reset token expired");
    expect((html.match(/disabled=""/g) || []).length).toBeGreaterThanOrEqual(4);
  });
});
