// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";

const organizerRegistrationsState = {
  data: {
    eventId: "evt-1",
    eventTitle: "Atlas Summit",
    registrations: [
      {
        id: "reg-1",
        participantName: "Sara Bennani",
        status: "CONFIRMED" as const,
        ticketRef: "TCK-001"
      }
    ]
  },
  isLoading: false,
  isError: false,
  error: undefined as Error | undefined
};

const organizerExportMutationState = {
  mutate: vi.fn(),
  isPending: false,
  isSuccess: false,
  error: null as Error | null,
  data: undefined as { filename: string } | undefined
};

vi.mock("next/navigation", () => ({
  useParams: () => ({ eventId: "evt-1" })
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) =>
    React.createElement("a", { href: String(href), ...props }, children)
}));

vi.mock("@/features/registrations/hooks/use-organizer-event-registrations-query", () => ({
  useOrganizerEventRegistrationsQuery: () => organizerRegistrationsState
}));

vi.mock("@/features/registrations/hooks/use-download-organizer-registrations-export-mutation", () => ({
  useDownloadOrganizerRegistrationsExportMutation: () => organizerExportMutationState
}));

vi.mock("@/features/registrations/components/organizer-registrations-list", () => ({
  OrganizerRegistrationsList: ({ eventTitle }: { eventTitle: string }) =>
    React.createElement("div", { "data-testid": "organizer-registrations-list" }, eventTitle)
}));

import OrganizerEventRegistrationsPage from "../[eventId]/registrations/page";

describe("organizer export actions", () => {
  afterEach(() => {
    cleanup();
    organizerExportMutationState.mutate.mockReset();
    organizerExportMutationState.isPending = false;
    organizerExportMutationState.isSuccess = false;
    organizerExportMutationState.error = null;
    organizerExportMutationState.data = undefined;
  });

  it("triggers the organizer export from the registrations page", () => {
    render(<OrganizerEventRegistrationsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));

    expect(organizerExportMutationState.mutate).toHaveBeenCalledWith({
      eventId: "evt-1"
    });
  });

  it("shows pending, success, and error feedback for organizer export", () => {
    organizerExportMutationState.isPending = true;
    const { rerender } = render(<OrganizerEventRegistrationsPage />);

    expect(screen.getByRole("button", { name: "Exporting..." }).hasAttribute("disabled")).toBe(true);

    organizerExportMutationState.isPending = false;
    organizerExportMutationState.isSuccess = true;
    organizerExportMutationState.data = {
      filename: "registrations-evt-1.csv"
    };
    rerender(<OrganizerEventRegistrationsPage />);

    expect(screen.getByRole("status").textContent).toContain(
      "Registration export downloaded successfully as registrations-evt-1.csv."
    );

    organizerExportMutationState.isSuccess = false;
    organizerExportMutationState.data = undefined;
    organizerExportMutationState.error = new Error(
      "Registration export is temporarily unavailable. Please retry."
    );
    rerender(<OrganizerEventRegistrationsPage />);

    expect(screen.getByRole("alert").textContent).toContain(
      "Registration export is temporarily unavailable. Please retry."
    );
  });
});
