import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) =>
    React.createElement("a", { href: String(href), ...props }, children)
}));

import AccessDeniedPage from "../page";

describe("access denied page", () => {
  it("renders the role mismatch recovery message", () => {
    const html = renderToStaticMarkup(<AccessDeniedPage />);

    expect(html).toContain("Access denied.");
    expect(html).toContain("reserved for another role");
    expect(html).toContain("Return to dashboard");
    expect(html).toContain("Browse events");
  });
});
