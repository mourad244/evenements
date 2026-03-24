// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";

type TicketState = {
  data?: {
    ticketId: string;
    ticketRef: string | null;
    registrationId: string;
    eventId: string;
    ticketFormat: string | null;
    status: string;
    payload: Record<string, unknown> | string | null;
    issuedAt: string | null;
    updatedAt: string | null;
  };
  isLoading: boolean;
  isError: boolean;
  error?: { message: string; status: number };
};

const ticketState: TicketState = {
  data: {
    ticketId: "tck-1",
    ticketRef: "TCK-ABC-123",
    registrationId: "reg-1",
    eventId: "evt-1",
    ticketFormat: "PDF",
    status: "ISSUED",
    payload: { eventTitle: "Atlas Summit" },
    issuedAt: "2026-04-02T09:00:00.000Z",
    updatedAt: "2026-04-03T09:00:00.000Z"
  },
  isLoading: false,
  isError: false,
  error: undefined
};

vi.mock("next/navigation", () => ({
  useParams: () => ({ ticketId: "tck-1" })
}));

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

vi.mock("@/features/tickets/hooks/use-ticket-query", () => ({
  useTicketQuery: () => ticketState
}));

import TicketDetailsPage from "../[ticketId]/page";

describe("ticket details page", () => {
  afterEach(() => {
    cleanup();
    ticketState.isLoading = false;
    ticketState.isError = false;
    ticketState.error = undefined;
    ticketState.data = {
      ticketId: "tck-1",
      ticketRef: "TCK-ABC-123",
      registrationId: "reg-1",
      eventId: "evt-1",
      ticketFormat: "PDF",
      status: "ISSUED",
      payload: { eventTitle: "Atlas Summit" },
      issuedAt: "2026-04-02T09:00:00.000Z",
      updatedAt: "2026-04-03T09:00:00.000Z"
    };
  });

  it("renders ticket data from the query", () => {
    render(<TicketDetailsPage />);

    expect(screen.getByText("Ticket details")).toBeTruthy();
    expect(screen.getByText("Ticket TCK-ABC-123")).toBeTruthy();
    expect(screen.getByText("Ticket ID")).toBeTruthy();
    expect(screen.getByText("Format")).toBeTruthy();
    expect(screen.getByText("Ticket payload")).toBeTruthy();
  });

  it("shows loading state", () => {
    ticketState.isLoading = true;

    render(<TicketDetailsPage />);

    expect(screen.getByText("Loading ticket details...")).toBeTruthy();
  });

  it("shows unavailable state for inactive or missing tickets", () => {
    ticketState.isError = true;
    ticketState.error = { message: "Ticket inactive", status: 410 };

    render(<TicketDetailsPage />);

    expect(screen.getByText("Ticket unavailable")).toBeTruthy();
  });

  it("shows error state for other failures", () => {
    ticketState.isError = true;
    ticketState.error = { message: "Server error", status: 500 };

    render(<TicketDetailsPage />);

    expect(screen.getByText("Could not load ticket")).toBeTruthy();
  });
});
