// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

const { apiState } = vi.hoisted(() => ({
  apiState: {
    get: vi.fn()
  }
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: apiState
}));

import { downloadTicket } from "../download-ticket";

describe("downloadTicket", () => {
  afterEach(() => {
    apiState.get.mockReset();
    vi.restoreAllMocks();
  });

  it("downloads the protected ticket and resolves the filename", async () => {
    Object.defineProperty(window.URL, "createObjectURL", {
      writable: true,
      value: () => "blob:initial"
    });
    Object.defineProperty(window.URL, "revokeObjectURL", {
      writable: true,
      value: () => undefined
    });

    const createObjectURL = vi
      .spyOn(window.URL, "createObjectURL")
      .mockReturnValue("blob:ticket-1");
    const revokeObjectURL = vi.spyOn(window.URL, "revokeObjectURL").mockImplementation(() => {});
    const click = vi.fn();
    const anchor = document.createElement("a");
    vi.spyOn(anchor, "click").mockImplementation(click);
    const appendChild = vi
      .spyOn(document.body, "appendChild")
      .mockImplementation(() => anchor);
    const createElement = vi.spyOn(document, "createElement").mockReturnValue(anchor);

    apiState.get.mockResolvedValue({
      data: new Blob(["PDF"], { type: "application/pdf" }),
      headers: {
        "content-type": "application/pdf",
        "content-disposition": 'attachment; filename="ticket-1.pdf"'
      }
    });

    const result = await downloadTicket({
      id: "reg-1",
      eventId: "evt-1",
      eventTitle: "Atlas Summit",
      status: "CONFIRMED",
      eventDate: "2026-04-02T09:00:00.000Z",
      eventCity: "Casablanca",
      waitlistPosition: null,
      canDownloadTicket: true,
      ticketId: "ticket-1",
      ticketFormat: "PDF",
      updatedAt: "2026-03-20T09:00:00.000Z"
    });

    expect(result.filename).toBe("ticket-1.pdf");
    expect(apiState.get).toHaveBeenCalledWith("/api/tickets/ticket-1/download", {
      responseType: "blob",
      headers: {
        accept: "application/pdf, image/png"
      }
    });
    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:ticket-1");
    appendChild.mockRestore();
    createElement.mockRestore();
  });

  it("maps expected gateway errors to readable copy", async () => {
    apiState.get.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 404
      },
      name: "AxiosError"
    });

    await expect(
      downloadTicket({
        id: "reg-1",
        eventId: "evt-1",
        eventTitle: "Atlas Summit",
        status: "CONFIRMED",
        eventDate: "2026-04-02T09:00:00.000Z",
        eventCity: "Casablanca",
        waitlistPosition: null,
        canDownloadTicket: true,
        ticketId: "ticket-1",
        ticketFormat: "PDF",
        updatedAt: "2026-03-20T09:00:00.000Z"
      })
    ).rejects.toMatchObject({
      message: "Ticket is not available yet for this registration.",
      status: 404
    });
  });
});
