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
  data: null as { status?: string } | null,
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
    canDownloadTicket: false,
    ticketId: null,
    ticketFormat: null
  },
  {
    id: "reg-2",
    eventId: "evt-2",
    eventTitle: "Builders Night",
    eventDate: "2026-05-02T09:00:00.000Z",
    eventCity: "Rabat",
    status: "CONFIRMED" as const,
    canDownloadTicket: true,
    ticketId: "ticket-2",
    ticketFormat: "PDF" as const
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
    paymentMutationState.data = null;
    paymentMutationState.error = null;
    paymentMutationState.variables = undefined;
  });

  it("shows pending feedback only for the registration currently being cancelled", () => {
    cancelMutationState.isPending = true;
    cancelMutationState.variables = "reg-1";

    render(<RegistrationList registrations={registrations} />);

    expect(screen.getByRole("button", { name: "Cancelling..." }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
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

  it("shows the payment action only for eligible registrations", () => {
    render(<RegistrationList registrations={registrations} />);

    expect(screen.getAllByRole("button", { name: "Start payment session" }).length).toBe(1);
    expect(screen.queryByText("Ticket pending issuance")).toBeTruthy();
  });

  it("triggers payment session creation with the correct payload", () => {
    render(<RegistrationList registrations={registrations} />);

    screen.getByRole("button", { name: "Start payment session" }).click();

    expect(paymentMutationState.mutate).toHaveBeenCalledWith({
      registrationId: "reg-1",
      eventId: "evt-1",
      amount: 0,
      currency: "MAD",
      metadata: { source: "participant-ui" }
    });
  });

  it("shows pending and success feedback for payment session creation", () => {
    paymentMutationState.isPending = true;
    paymentMutationState.variables = { registrationId: "reg-1" };

    const { rerender } = render(<RegistrationList registrations={registrations} />);

    expect(screen.getByRole("button", { name: "Starting session..." }).hasAttribute("disabled")).toBe(true);

    paymentMutationState.isPending = false;
    paymentMutationState.data = { status: "PENDING" };
    paymentMutationState.variables = { registrationId: "reg-1" };
    rerender(<RegistrationList registrations={registrations} />);

    expect(screen.getByText("Payment status")).toBeTruthy();
    expect(screen.getByText("Pending confirmation")).toBeTruthy();
  });

  it("shows payment session error feedback", () => {
    paymentMutationState.error = new Error("Payment failed");

    render(<RegistrationList registrations={registrations} />);

    expect(screen.getByRole("alert").textContent).toContain("Payment failed");
  });

  it("shows a clear pending payment block without ticket-ready messaging", () => {
    paymentMutationState.data = { status: "PENDING" };
    paymentMutationState.variables = { registrationId: "reg-1" };

    render(<RegistrationList registrations={registrations} />);

    expect(screen.getByText("Payment status")).toBeTruthy();
    expect(screen.getByText("Pending confirmation")).toBeTruthy();
    expect(
      screen.getByText(
        "Payment is not completed yet. Once confirmation arrives, your ticket will update automatically."
      )
    ).toBeTruthy();
    expect(screen.getByText("Ticket awaiting payment confirmation")).toBeTruthy();
    expect(screen.queryByText("Ticket available")).toBeNull();
  });

  it("keeps ticket-ready registrations showing the ticket action and no payment block", () => {
    render(<RegistrationList registrations={registrations} />);

    expect(screen.getByText("PDF available")).toBeTruthy();
    expect(screen.getByRole("button", { name: "View ticket" })).toBeTruthy();
    expect(screen.queryByText("Payment status")).toBeNull();
  });
});
