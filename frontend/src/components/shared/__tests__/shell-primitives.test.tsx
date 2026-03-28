import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DataTableShell } from "../data-table-shell";
import { SectionPanel } from "../section-panel";
import { SummaryCard } from "../summary-card";

function render(element: React.ReactElement) {
  return renderToStaticMarkup(element);
}

describe("shared shell primitives", () => {
  it("SummaryCard renders accessible summary content", () => {
    const html = render(
      <SummaryCard
        label="Confirmed participants"
        value="24"
        description="Participants currently confirmed for this event."
        accent="highlight"
      />
    );

    expect(html).toContain('aria-label="Confirmed participants"');
    expect(html).toContain(">24<");
    expect(html).toContain("Participants currently confirmed for this event.");
    expect(html).toContain("tabular-nums");
  });

  it("SectionPanel renders a labeled region linked to its visible heading", () => {
    const html = render(
      <SectionPanel
        eyebrow="Organizer overview"
        title="Managed events"
        description="Review your latest event activity."
        action={<button type="button">Open workspace</button>}
      >
        <div>Section content</div>
      </SectionPanel>
    );

    expect(html).toContain('role="region"');
    expect(html).toContain('aria-labelledby="managed-events-section-title"');
    expect(html).toContain('id="managed-events-section-title"');
    expect(html).toContain("Managed events");
    expect(html).toContain("Open workspace");
    expect(html).toContain("Section content");
  });

  it("DataTableShell renders a labeled region with scroll guidance and a focusable table wrapper", () => {
    const html = render(
      <DataTableShell
        title="User list"
        description="Review identity and access role."
        meta={<p>4 visible users</p>}
        caption="Platform users with role and creation date"
      >
        <thead>
          <tr>
            <th scope="col">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Samira</td>
          </tr>
        </tbody>
      </DataTableShell>
    );

    expect(html).toContain('role="region"');
    expect(html).toContain('aria-labelledby="user-list-table-title"');
    expect(html).toContain('id="user-list-table-hint"');
    expect(html).toContain("Scroll horizontally on smaller screens to review every column.");
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="User list table"');
    expect(html).toContain('aria-describedby="user-list-table-hint"');
    expect(html).toContain("Platform users with role and creation date");
  });
});
