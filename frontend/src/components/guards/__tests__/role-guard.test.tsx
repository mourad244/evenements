// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const routerState = {
  replace: vi.fn()
};

vi.mock("next/navigation", () => ({
  useRouter: () => routerState
}));

import { RoleGuard } from "../role-guard";

describe("RoleGuard", () => {
  afterEach(() => {
    cleanup();
    routerState.replace.mockReset();
  });

  it("redirects signed-in users without the expected role to access denied", () => {
    render(
      <RoleGuard
        user={{
          id: "user-1",
          email: "ibrahim@example.com",
          fullName: "Ibrahim",
          role: "PARTICIPANT"
        }}
        allowedRoles={["ADMIN"]}
      >
        <div>Restricted content</div>
      </RoleGuard>
    );

    expect(routerState.replace).toHaveBeenCalledWith("/access-denied");
  });
});
