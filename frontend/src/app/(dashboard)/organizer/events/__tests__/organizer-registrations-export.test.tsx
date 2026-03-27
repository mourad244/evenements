// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

const exportSpy = vi.fn();

const organizerRegistrationsState = {
  data: {
    eventTitle: "Atlas Summit",
    registrations: [
      {
        id: "reg-1",
        participantName: "Sara Bennani",
        status: "CONFIRMED",
        ticketRef: "TCK-001"
      }
    ]
  },
  isLoading: false,
  isError: false,
  error: undefined
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

vi.mock("@/features/registrations/api/export-organizer-event-registrations", () => ({
  exportOrganizerEventRegistrations: (...args: unknown[]) => exportSpy(...args)
}));

import OrganizerEventRegistrationsPage from "../[eventId]/registrations/page";

const createObjectURLMock = vi.fn(() => "blob:mock");
const revokeObjectURLMock = vi.fn();

describe("organizer registrations export", () => {
  beforeAll(() => {
    Object.defineProperty(window, "URL", {
      value: {
        ...window.URL,
        createObjectURL: createObjectURLMock,
        revokeObjectURL: revokeObjectURLMock
      },
      writable: true
    });
  });

  afterEach(() => {
    cleanup();
    exportSpy.mockReset();
    createObjectURLMock.mockClear();
    revokeObjectURLMock.mockClear();
  });

  it("renders export action and shows success feedback", async () => {
    let resolveExport: ((value: { blob: Blob; filename: string }) => void) | undefined;
    const exportPromise = new Promise<{ blob: Blob; filename: string }>((resolve) => {
      resolveExport = resolve;
    });
    exportSpy.mockReturnValueOnce(exportPromise);

    render(<OrganizerEventRegistrationsPage />);

    const exportButton = screen.getByRole("button", { name: "Export CSV" });
    fireEvent.click(exportButton);

    expect(exportSpy).toHaveBeenCalledWith("evt-1");
    expect(screen.getByText("Exporting...")).toBeTruthy();

    if (!resolveExport) {
      throw new Error("Export promise resolver unavailable");
    }

    resolveExport({
      blob: new Blob(["csv"]),
      filename: "event-evt-1-registrations.csv"
    });

    await waitFor(() =>
      expect(
        screen.getByText("CSV export started. Your download should begin shortly.")
      ).toBeTruthy()
    );
  });

  it("shows error feedback when export fails", async () => {
    exportSpy.mockRejectedValueOnce({ message: "Export failed right now" });

    render(<OrganizerEventRegistrationsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("Export failed right now")
    );
  });
});
