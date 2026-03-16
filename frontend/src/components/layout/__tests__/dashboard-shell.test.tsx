import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

let pathname = "/dashboard";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) =>
    React.createElement("a", { href: String(href), ...props }, children)
}));

import { DashboardHeader } from "../dashboard-header";
import { DashboardLayout } from "../dashboard-layout";
import { DashboardSidebar } from "../dashboard-sidebar";

function render(element: React.ReactElement) {
  return renderToStaticMarkup(element);
}

describe("dashboard shell components", () => {
  beforeEach(() => {
    pathname = "/dashboard";
  });

  it("DashboardSidebar renders workspace navigation, active link state, and current section cue", () => {
    pathname = "/organizer/events/evt-1/registrations";

    const html = render(
      <DashboardSidebar
        title="Organizer workspace"
        description="Move between event editing and registrations."
        links={[
          { href: "/organizer/events", label: "All events" },
          { href: "/organizer/events/evt-1/registrations", label: "Registrations" }
        ]}
      />
    );

    expect(html).toContain('aria-label="Organizer workspace sidebar"');
    expect(html).toContain('aria-label="Organizer workspace navigation"');
    expect(html).toContain("Current section");
    expect(html).toContain("Registrations");
    expect(html).toContain('aria-current="page"');
    expect(html).toContain(">Here<");
  });

  it("DashboardHeader renders the labeled overview content", () => {
    const html = render(
      <DashboardHeader
        eyebrow="Dashboard"
        title="Welcome back"
        description="Review your current workspace."
      />
    );

    expect(html).toContain('aria-label="Welcome back overview"');
    expect(html).toContain("Dashboard");
    expect(html).toContain("Welcome back");
    expect(html).toContain("Current workspace");
  });

  it("DashboardLayout renders the labeled content area with header and sidebar", () => {
    pathname = "/admin/users";

    const html = render(
      <DashboardLayout
        eyebrow="Admin"
        title="Admin tools"
        description="Review users and events."
        sidebarTitle="Admin workspace"
        sidebarDescription="Switch between the current admin surfaces."
        sidebarLinks={[
          { href: "/admin/events", label: "Events" },
          { href: "/admin/users", label: "Users" }
        ]}
      >
        <div>Dashboard body</div>
      </DashboardLayout>
    );

    expect(html).toContain('aria-label="Admin tools content"');
    expect(html).toContain("Admin tools");
    expect(html).toContain("Dashboard body");
    expect(html).toContain("Users");
  });
});
