// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

type ProfileState = {
  data?: {
    id: string;
    userId: string;
    fullName: string;
    displayName: string;
    name: string;
    email: string;
    role: "PARTICIPANT" | "ORGANIZER";
    phone: string | null;
    city: string | null;
    bio: string | null;
  };
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  refetch: () => void;
};

type MutationState = {
  mutateAsync: (payload: Record<string, unknown>) => Promise<unknown>;
  isPending: boolean;
  isSuccess: boolean;
  error: Error | null;
};

const profileState: ProfileState = {
  data: {
    id: "user-1",
    userId: "user-1",
    fullName: "Ibrahim El A.",
    displayName: "Ibrahim",
    name: "Ibrahim",
    email: "ibrahim@example.com",
    role: "PARTICIPANT",
    phone: null,
    city: "Casablanca",
    bio: "Participant profile note."
  },
  isLoading: false,
  isError: false,
  error: undefined,
  refetch: vi.fn()
};

const updateMutationState: MutationState = {
  mutateAsync: vi.fn(async () => undefined),
  isPending: false,
  isSuccess: false,
  error: null
};

vi.mock("@/components/guards/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children)
}));

vi.mock("@/features/auth/hooks/use-current-user", () => ({
  useCurrentUser: () => ({
    data: { fullName: "Ibrahim", role: "PARTICIPANT" },
    isLoading: false
  })
}));

vi.mock("@/features/auth/hooks/use-profile-query", () => ({
  useProfileQuery: () => profileState
}));

vi.mock("@/features/auth/hooks/use-update-profile-mutation", () => ({
  useUpdateProfileMutation: () => updateMutationState
}));

import ProfilePage from "../page";

describe("profile page", () => {
  afterEach(() => {
    cleanup();
    updateMutationState.isPending = false;
    updateMutationState.isSuccess = false;
    updateMutationState.error = null;
    updateMutationState.mutateAsync = vi.fn(async () => undefined);
  });

  it("renders profile data and keeps email/role read-only", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect((screen.getByLabelText("Full name") as HTMLInputElement).value).toBe(
        "Ibrahim El A."
      );
    });

    expect((screen.getByLabelText("Display name") as HTMLInputElement).value).toBe("Ibrahim");
    expect((screen.getByLabelText("City") as HTMLInputElement).value).toBe("Casablanca");
    expect((screen.getByLabelText("Email") as HTMLInputElement).value).toBe("ibrahim@example.com");
    expect((screen.getByLabelText("Role") as HTMLInputElement).value).toBe("PARTICIPANT");

    expect(screen.getByLabelText("Email").hasAttribute("disabled")).toBe(true);
    expect(screen.getByLabelText("Role").hasAttribute("disabled")).toBe(true);
  });

  it("allows editing fields and submits the correct PATCH payload", async () => {
    const mutateSpy = vi.fn(async () => undefined);
    updateMutationState.mutateAsync = mutateSpy;

    render(<ProfilePage />);

    fireEvent.change(screen.getByLabelText("Full name"), {
      target: { value: "Ibrahim Updated" }
    });
    fireEvent.change(screen.getByLabelText("Display name"), {
      target: { value: "Ibrahim U." }
    });
    fireEvent.change(screen.getByLabelText("Phone"), {
      target: { value: "+212600000000" }
    });
    fireEvent.change(screen.getByLabelText("City"), {
      target: { value: "Rabat" }
    });
    fireEvent.change(screen.getByLabelText("Bio"), {
      target: { value: "Updated profile bio." }
    });

    fireEvent.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() => {
      expect(mutateSpy).toHaveBeenCalledWith({
        fullName: "Ibrahim Updated",
        displayName: "Ibrahim U.",
        phone: "+212600000000",
        city: "Rabat",
        bio: "Updated profile bio."
      });
    });
  });

  it("shows success feedback after a successful update", async () => {
    updateMutationState.isSuccess = true;

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Profile saved and ready.")).toBeTruthy();
    });
  });

  it("shows error feedback when the update fails", async () => {
    updateMutationState.error = new Error("Profile update failed");

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain("Profile update failed");
    });
  });
});
