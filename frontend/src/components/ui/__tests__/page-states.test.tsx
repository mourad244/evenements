import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Link from "next/link";

import { EmptyState } from "../empty-state";
import { ErrorState } from "../error-state";
import { LoadingState } from "../loading-state";
import { UnavailableState } from "../unavailable-state";

function render(element: React.ReactElement) {
  return renderToStaticMarkup(element);
}

describe("page state primitives", () => {
  it("LoadingState renders its label and status role", () => {
    const html = render(<LoadingState label="Loading registrations..." />);

    expect(html).toContain('role="status"');
    expect(html).toContain("Loading registrations...");
  });

  it("ErrorState renders title, description, and optional actions", () => {
    const html = render(
      <ErrorState
        title="Could not load events"
        description="Please try again in a moment."
        action={<button type="button">Retry</button>}
      />
    );

    expect(html).toContain('role="alert"');
    expect(html).toContain("Could not load events");
    expect(html).toContain("Please try again in a moment.");
    expect(html).toContain("Retry");
  });

  it("EmptyState renders content and supports left alignment", () => {
    const html = render(
      <EmptyState
        title="No registrations yet"
        description="Your participant history will appear here."
        align="left"
        action={<Link href="/events">Browse events</Link>}
      />
    );

    expect(html).toContain("No registrations yet");
    expect(html).toContain("Your participant history will appear here.");
    expect(html).toContain("text-left");
    expect(html).toContain("Browse events");
  });

  it("UnavailableState renders title, description, and optional actions", () => {
    const html = render(
      <UnavailableState
        title="Event unavailable"
        description="This event could not be found."
        action={<Link href="/events">Back to events</Link>}
      />
    );

    expect(html).toContain("Event unavailable");
    expect(html).toContain("This event could not be found.");
    expect(html).toContain("Back to events");
  });
});
