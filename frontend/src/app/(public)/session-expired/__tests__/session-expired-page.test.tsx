import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) =>
    React.createElement("a", { href: String(href), ...props }, children)
}));

import SessionExpiredPage from "../page";

describe("session expired page", () => {
  it("renders the recovery message and sign-in path", () => {
    const html = renderToStaticMarkup(<SessionExpiredPage />);

    expect(html).toContain("Your session expired.");
    expect(html).toContain("Please sign in again to continue where you left off.");
    expect(html).toContain("Return to sign in");
    expect(html).toContain("Browse events");
  });
});
