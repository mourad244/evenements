import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

let pathname = "/";
let token: string | null = null;
let currentUser:
  | {
      fullName: string;
      role: "PARTICIPANT" | "ORGANIZER" | "ADMIN";
    }
  | null = null;
let forceMobileOpen = false;

const pushMock = vi.fn();
const setQueryDataMock = vi.fn();
const removeQueriesMock = vi.fn();

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");

  return {
    ...actual,
    useState: (initial: unknown) => [
      forceMobileOpen
        ? true
        : typeof initial === "function"
          ? (initial as () => unknown)()
          : initial,
      vi.fn()
    ]
  };
});

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useRouter: () => ({ push: pushMock })
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) =>
    React.createElement("a", { href: String(href), ...props }, children)
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    setQueryData: setQueryDataMock,
    removeQueries: removeQueriesMock
  })
}));

vi.mock("@/features/auth/hooks/use-current-user", () => ({
  useCurrentUser: () => ({ data: currentUser })
}));

vi.mock("@/features/auth/utils/auth-storage", () => ({
  clearSession: vi.fn(),
  clearSessionExpired: vi.fn()
}));

vi.mock("@/lib/auth/get-token", () => ({
  getToken: () => token
}));

import { Navbar } from "../navbar";

function render(element: React.ReactElement) {
  return renderToStaticMarkup(element);
}

describe("Navbar", () => {
  beforeEach(() => {
    pathname = "/";
    token = null;
    currentUser = null;
    forceMobileOpen = false;
    pushMock.mockReset();
    setQueryDataMock.mockReset();
    removeQueriesMock.mockReset();
  });

  it("renders public navigation for signed-out visitors", () => {
    const html = render(<Navbar />);

    expect(html).toContain('aria-label="Primary navigation"');
    expect(html).toContain(">Events<");
    expect(html).not.toContain(">Dashboard<");
    expect(html).not.toContain(">My registrations<");
    expect(html).toContain("Create account");
    expect(html).toContain("Sign in");
  });

  it("renders participant workspace navigation with active route and current section cue", () => {
    pathname = "/my-registrations";
    token = "participant-token";
    currentUser = {
      fullName: "Sara Participant",
      role: "PARTICIPANT"
    };

    const html = render(<Navbar />);

    expect(html).toContain(">Dashboard<");
    expect(html).toContain(">My registrations<");
    expect(html).not.toContain(">Organizer<");
    expect(html).not.toContain(">Admin<");
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("Participant workspace");
    expect(html).toContain("Sara Participant");
  });

  it("renders admin role-aware navigation with admin current section cue", () => {
    pathname = "/admin/users";
    token = "admin-token";
    currentUser = {
      fullName: "Amina Admin",
      role: "ADMIN"
    };

    const html = render(<Navbar />);

    expect(html).toContain(">Organizer<");
    expect(html).toContain(">Admin<");
    expect(html).not.toContain(">My registrations<");
    expect(html).toContain("Admin workspace");
    expect(html).toContain("Amina Admin");
  });

  it("renders the mobile navigation panel with current section context when open", () => {
    pathname = "/organizer/events";
    token = "organizer-token";
    currentUser = {
      fullName: "Omar Organizer",
      role: "ORGANIZER"
    };
    forceMobileOpen = true;

    const html = render(<Navbar />);

    expect(html).toContain('id="mobile-navigation"');
    expect(html).toContain('aria-label="Mobile navigation"');
    expect(html).toContain("Current section");
    expect(html).toContain("Organizer workspace");
    expect(html).toContain(">Workspace<");
    expect(html).toContain(">Organizer<");
  });
});
