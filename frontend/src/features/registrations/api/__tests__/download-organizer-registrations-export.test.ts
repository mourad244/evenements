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

import { downloadOrganizerRegistrationsExport } from "../download-organizer-registrations-export";

describe("downloadOrganizerRegistrationsExport", () => {
  afterEach(() => {
    apiState.get.mockReset();
    vi.restoreAllMocks();
  });

  it("downloads the organizer export CSV and resolves the filename", async () => {
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
      .mockReturnValue("blob:registrations");
    const revokeObjectURL = vi.spyOn(window.URL, "revokeObjectURL").mockImplementation(() => {});
    const click = vi.fn();
    const anchor = document.createElement("a");
    vi.spyOn(anchor, "click").mockImplementation(click);
    const appendChild = vi
      .spyOn(document.body, "appendChild")
      .mockImplementation(() => anchor);
    const createElement = vi.spyOn(document, "createElement").mockReturnValue(anchor);

    apiState.get.mockResolvedValue({
      data: new Blob(["id,name"], { type: "text/csv" }),
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": 'attachment; filename="registrations-evt-1.csv"'
      }
    });

    const result = await downloadOrganizerRegistrationsExport({ eventId: "evt-1" });

    expect(result.filename).toBe("registrations-evt-1.csv");
    expect(apiState.get).toHaveBeenCalledWith("/api/organizer/events/evt-1/registrations/export", {
      responseType: "blob",
      headers: {
        accept: "text/csv"
      }
    });
    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:registrations");
    appendChild.mockRestore();
    createElement.mockRestore();
  });

  it("maps organizer export gateway errors to readable copy", async () => {
    apiState.get.mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 403
      },
      name: "AxiosError"
    });

    await expect(
      downloadOrganizerRegistrationsExport({ eventId: "evt-1" })
    ).rejects.toMatchObject({
      message: "You are not allowed to export registrations for this event.",
      status: 403
    });
  });
});
