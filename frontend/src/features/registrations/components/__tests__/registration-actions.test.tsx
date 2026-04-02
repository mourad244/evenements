// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";

const cancelMutationState = {
  mutate: vi.fn(),
  isPending: false,
  isSuccess: false,
  error: null as Error | null,
  variables: undefined as string | undefined
};

const paymentMutationState = {
  mutate: vi.fn(),
  isPending: false,
  isSuccess: false,
  data: null as null | { registrationId?: string },
  error: null as Error | null,
  variables: undefined as { registrationId?: string } | undefined
};

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) =>
    React.createElement("a", { href: String(href), ...props }, children)
}));

vi.mock("@/features/registrations/hooks/use-cancel-registration-mutation", () => ({
  useCancelRegistrationMutation: () => cancelMutationState
}));

vi.mock("@/features/payments/hooks/use-create-payment-session-mutation", () => ({
  useCreatePaymentSessionMutation: () => paymentMutationState
}));

import { RegistrationList } from "../registration-list";

const registrations = [
  {
    id: "reg-1",
    eventId: "evt-1",
    eventTitle: "Atlas Summit",
    eventDate: "2026-04-02T09:00:00.000Z",
    eventCity: "Casablanca",
    status: "CONFIRMED" as const,
    canDownloadTicket: true,
    ticketId: "ticket-1",
    ticketFormat: "PDF" as const
  },
  {
    id: "reg-2",
    eventId: "evt-2",
    eventTitle: "Builders Night",
    eventDate: "2026-05-02T09:00:00.000Z",
    eventCity: "Rabat",
    status: "CONFIRMED" as const,
    canDownloadTicket: false,
    ticketId: "ticket-2",
    ticketFormat: null
  },
  {
    id: "reg-3",
    eventId: "evt-3",
    eventTitle: "Design Circle",
    eventDate: "2026-05-02T09:00:00.000Z",
    eventCity: "Rabat",
    status: "WAITLISTED" as const,
    canDownloadTicket: false,
    ticketId: null,
    ticketFormat: null,
    waitlistPosition: 3
  }
];

describe("registration action feedback", () => {
  afterEach(() => {
    cleanup();
    cancelMutationState.mutate.mockReset();
    cancelMutationState.isPending = false;
    cancelMutationState.isSuccess = false;
    cancelMutationState.error = null;
    cancelMutationState.variables = undefined;
    paymentMutationState.mutate.mockReset();
    paymentMutationState.isPending = false;
    paymentMutationState.isSuccess = false;
    paymentMutationState.data = null;
    paymentMutationState.error = null;
    paymentMutationState.variables = undefined;
  });

  it("shows pending feedback only for the registration currently being cancelled", () => {
    cancelMutationState.isPending = true;
    cancelMutationState.variables = "reg-1";

    render(<RegistrationList registrations={registrations} />);

    expect(screen.getByRole("button", { name: "Cancelling..." }).hasAttribute("disabled")).toBe(true);
    expect(screen.getAllByRole("button", { name: "Cancel" }).length).toBeGreaterThan(0);
  });

  it("shows cancellation success feedback", () => {
    cancelMutationState.isSuccess = true;

    render(<RegistrationList registrations={registrations} />);

    expect(screen.getByRole("status").textContent).toContain(
      "Your registration was cancelled. The list will refresh automatically."
    );
  });

  it("shows cancellation error feedback", () => {
    cancelMutationState.error = new Error("Could not cancel this registration");

    render(<RegistrationList registrations={registrations} />);

    expect(screen.getByRole("alert").textContent).toContain("Could not cancel this registration");
  });

  it("shows payment pending state when ticket exists but is not ready", () => {
    render(<RegistrationList registrations={registrations} />);

    expect(screen.getAllByText("Payment pending").length).toBe(1);
    expect(
      screen.getByText(
        "Payment confirmation will update your ticket automatically. Return here for the latest status."
      )
    ).toBeTruthy();
  });

  it("does not show the ticket-ready action when payment is still pending", () => {
    render(<RegistrationList registrations={registrations} />);

    const viewButtons = screen.getAllByRole("button", { name: "View ticket" });
    expect(viewButtons.length).toBe(1);
  });
});
