// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

type RegistrationsState = {
  data?: {
    eventTitle: string;
    registrations: Array<{
      id: string;
      participantName: string;
      status: "CONFIRMED" | "WAITLISTED" | "CANCELLED" | "REJECTED";
      ticketRef?: string | null;
    }>;
  };
  isLoading: boolean;
  isError: boolean;
  error?: Error;
};

type ExportState = {
  mutate: (eventId: string) => void;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  variables?: string;
};

const registrationsState: RegistrationsState = {
  data: {
    eventTitle: "Atlas Summit",
    registrations: []
  },
  isLoading: false,
  isError: false
};

const exportState: ExportState = {
  mutate: vi.fn(),
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null,
  variables: undefined
};

vi.mock("next/navigation", () => ({
  useParams: () => ({ eventId: "evt-123" })
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) =>
    React.createElement("a", { href: String(href), ...props }, children)
}));

vi.mock("@/features/registrations/hooks/use-organizer-event-registrations-query", () => ({
  useOrganizerEventRegistrationsQuery: () => registrationsState
}));

vi.mock("@/features/registrations/hooks/use-export-organizer-event-registrations-mutation", () => ({
  useExportOrganizerEventRegistrationsMutation: () => exportState
}));

import OrganizerEventRegistrationsPage from "../[eventId]/registrations/page";

describe("organizer registrations export", () => {
  beforeEach(() => {
    registrationsState.data = {
      eventTitle: "Atlas Summit",
      registrations: []
    };
    registrationsState.isLoading = false;
    registrationsState.isError = false;
    registrationsState.error = undefined;

    exportState.mutate = vi.fn();
    exportState.isPending = false;
    exportState.isSuccess = false;
    exportState.isError = false;
    exportState.error = null;
    exportState.variables = undefined;
  });

  it("renders Export CSV action and triggers export with eventId", () => {
    render(<OrganizerEventRegistrationsPage />);

    const button = screen.getByRole("button", { name: "Export CSV" });
    fireEvent.click(button);

    expect(exportState.mutate).toHaveBeenCalledWith("evt-123");
  });

  it("shows pending, success, and error feedback for export", () => {
    exportState.isPending = true;

    const { rerender } = render(<OrganizerEventRegistrationsPage />);

    expect(screen.getByRole("button", { name: "Exporting..." }).hasAttribute("disabled")).toBe(true);

    exportState.isPending = false;
    exportState.isSuccess = true;
    rerender(<OrganizerEventRegistrationsPage />);

    expect(
      screen.getByText("CSV export started. Your download should begin automatically.")
    ).toBeTruthy();

    exportState.isSuccess = false;
    exportState.isError = true;
    exportState.error = new Error("Export failed");
    rerender(<OrganizerEventRegistrationsPage />);

    expect(screen.getByRole("alert").textContent).toContain("Export failed");
  });
});
