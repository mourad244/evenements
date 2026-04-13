// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

const mutationState = {
  mutateAsync: vi.fn(async () => undefined),
  isPending: false,
  isSuccess: false,
  error: null as Error | null
};

vi.mock("@/features/registrations/hooks/use-register-to-event-mutation", () => ({
  useRegisterToEventMutation: () => mutationState
}));

import { RegistrationForm } from "../registration-form";

describe("registration form", () => {
  afterEach(() => {
    cleanup();
    mutationState.mutateAsync.mockReset();
    mutationState.isPending = false;
    mutationState.isSuccess = false;
    mutationState.error = null;
  });

  it("renders helper text and focuses the event field on invalid submit", async () => {
    render(<RegistrationForm eventId="" />);

    expect(
      screen.getByText("Paste the event identifier from the public event page.")
    ).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Join event" }));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain("Fix the registration form");
    });

    expect(screen.getAllByText("Event ID is required").length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByLabelText("Event ID"));
    });
  });
});
