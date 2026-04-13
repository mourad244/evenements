// @vitest-environment jsdom

import axios, { AxiosError } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";

import { attachInterceptors } from "../interceptors";

function createUnauthorizedError(config: Record<string, unknown> & { headers: Record<string, string> }) {
  return new AxiosError(
    "Unauthorized",
    "ERR_BAD_REQUEST",
    config as never,
    {},
    {
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config,
      data: {}
    }
  );
}

describe("attachInterceptors", () => {
  afterEach(() => {
    localStorage.clear();
    document.cookie = "event-platform.token=; path=/; max-age=0; samesite=lax";
    sessionStorage.clear();
    vi.restoreAllMocks();
    window.history.replaceState({}, "", "/login");
  });

  it("refreshes the access token once and retries the original request", async () => {
    localStorage.setItem("event-platform.token", "expired-token");
    localStorage.setItem("event-platform.refresh-token", "refresh-token-1");

    const adapter = vi
      .fn()
      .mockRejectedValueOnce(
        createUnauthorizedError({
          headers: {
            Authorization: "Bearer expired-token"
          }
        })
      )
      .mockResolvedValueOnce({
        data: {
          ok: true
        },
        status: 200,
        statusText: "OK",
        headers: {},
        config: {
          headers: {
            Authorization: "Bearer access-token-2"
          }
        }
      });

    vi.spyOn(axios, "post").mockResolvedValue({
      data: {
        data: {
          accessToken: "access-token-2",
          refreshToken: "refresh-token-2"
        }
      }
    } as never);

    const client = attachInterceptors(axios.create({ adapter }));
    const response = await client.get("/protected");

    expect(response.data.ok).toBe(true);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem("event-platform.token")).toBe("access-token-2");
    expect(localStorage.getItem("event-platform.refresh-token")).toBe("refresh-token-2");
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it("marks the session expired when refresh fails", async () => {
    localStorage.setItem("event-platform.token", "expired-token");
    localStorage.setItem("event-platform.refresh-token", "refresh-token-1");

    const adapter = vi.fn().mockRejectedValue(
      createUnauthorizedError({
        headers: {
          Authorization: "Bearer expired-token"
        }
      })
    );

    vi.spyOn(axios, "post").mockRejectedValue(new Error("refresh failed"));

    const client = attachInterceptors(axios.create({ adapter }));

    await expect(client.get("/protected")).rejects.toBeTruthy();
    expect(localStorage.getItem("event-platform.token")).toBeNull();
    expect(localStorage.getItem("event-platform.refresh-token")).toBeNull();
    expect(sessionStorage.getItem("event-platform.session-expired")).toBe("true");
  });
});
