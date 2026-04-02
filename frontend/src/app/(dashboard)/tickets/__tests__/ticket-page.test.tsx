// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import React from "react";

type TicketState = {
  data?: {
    ticketId: string;
    registrationId: string;
    eventId: string;
    participantId: string;
    status: string;
    ticketFormat?: string | null;
    ticketRef?: string | null;
    eventTitle?: string | null;
    eventCity?: string | null;
    eventStartAt?: string | null;
    participantName?: string | null;
    issuedAt?: string | null;
    updatedAt?: string | null;
  } | null;
  isLoading: boolean;
  isError: boolean;
  error?: { message: string; status: number };
};

const ticketState: TicketState = {
  data: null,
  isLoading: false,
  isError: false
};

vi.mock("next/navigation", () => ({
  useParams: () => ({ ticketId: "ticket-123" })
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) =>
    React.createElement("a", { href: String(href), ...props }, children)
}));

vi.mock("@/features/tickets/hooks/use-ticket-query", () => ({
  useTicketQuery: () => ticketState
}));

import TicketPage from "../[ticketId]/page";

describe("ticket page", () => {
  beforeEach(() => {
    ticketState.data = null;
    ticketState.isLoading = false;
    ticketState.isError = false;
    ticketState.error = undefined;
  });

  it("renders ticket details from the backend payload", () => {
    ticketState.data = {
      ticketId: "ticket-123",
      registrationId: "reg-1",
      eventId: "evt-1",
      participantId: "user-1",
      status: "ISSUED",
      ticketFormat: "PDF",
      ticketRef: "TCK-1",
      eventTitle: "Atlas Summit",
      eventCity: "Casablanca",
      eventStartAt: "2026-04-01T09:00:00.000Z",
      participantName: "Ibrahim",
      issuedAt: "2026-03-20T10:00:00.000Z",
      updatedAt: "2026-03-21T10:00:00.000Z"
    };

    render(<TicketPage />);

    expect(screen.getByText("Ticket issued")).toBeTruthy();
    expect(screen.getByText("Atlas Summit ticket")).toBeTruthy();
    expect(screen.getByText("Reference: TCK-1")).toBeTruthy();
    expect(screen.getByText("Location: Casablanca")).toBeTruthy();
    expect(screen.getByText("Participant")).toBeTruthy();
  });

  it("handles inactive ticket states", () => {
    ticketState.isError = true;
    ticketState.error = { message: "Ticket inactive", status: 410 };

    render(<TicketPage />);

    expect(screen.getByText("Ticket inactive")).toBeTruthy();
    expect(
      screen.getByText(
        "This ticket is no longer active. If you believe this is a mistake, review your registrations."
      )
    ).toBeTruthy();
  });
});
