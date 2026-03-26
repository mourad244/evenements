import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

type UserState = {
  data?: { fullName: string; role: "PARTICIPANT" | "ORGANIZER" | "ADMIN" } | null;
  isLoading: boolean;
};

type RegistrationsState = {
  data?: {
    items: Array<{
      id: string;
      eventId: string;
      eventTitle: string;
      eventDate: string;
      status: "CONFIRMED" | "WAITLISTED" | "CANCELLED" | "REJECTED";
      canDownloadTicket?: boolean;
    }>;
    pagination?: { page: number; pageSize: number; total: number; totalPages: number };
  };
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  isFetching?: boolean;
};

type OrganizerEventsState = {
  data?: Array<{
    id: string;
    title: string;
    city: string;
    startAt: string;
    status: "DRAFT" | "PUBLISHED";
  }>;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
};

const userState: UserState = {
  data: { fullName: "Ibrahim", role: "PARTICIPANT" },
  isLoading: false
};

const registrationsState: RegistrationsState = {
  data: { items: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1 } },
  isLoading: false,
  isError: false,
  isFetching: false
};

const organizerEventsState: OrganizerEventsState = {
  data: [],
  isLoading: false,
  isError: false
};

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) =>
    React.createElement("a", { href: String(href), ...props }, children)
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(""),
  usePathname: () => "/my-registrations",
  useRouter: () => ({ replace: vi.fn() })
}));

vi.mock("@/features/auth/hooks/use-current-user", () => ({
  useCurrentUser: () => userState
}));

vi.mock("@/features/registrations/hooks/use-my-registrations-query", () => ({
  useMyRegistrationsQuery: () => registrationsState
}));

vi.mock("@/features/events/hooks/use-organizer-events-query", () => ({
  useOrganizerEventsQuery: () => organizerEventsState
}));

vi.mock("@/components/guards/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
}));

vi.mock("@/features/registrations/components/registration-list", () => ({
  RegistrationList: ({ registrations }: { registrations: Array<{ eventTitle: string }> }) =>
    React.createElement(
      "div",
      { "data-testid": "registration-list" },
      registrations.length > 0 ? registrations.map((item) => item.eventTitle).join(", ") : "registration-list-empty"
    )
}));

import DashboardPage from "../dashboard/page";
import MyRegistrationsPage from "../my-registrations/page";

function render(element: React.ReactElement) {
  return renderToStaticMarkup(element);
}

describe("dashboard routes", () => {
  beforeEach(() => {
    userState.data = { fullName: "Ibrahim", role: "PARTICIPANT" };
    userState.isLoading = false;

    registrationsState.data = {
      items: [],
      pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1 }
    };
    registrationsState.isLoading = false;
    registrationsState.isError = false;
    registrationsState.error = undefined;
    registrationsState.isFetching = false;

    organizerEventsState.data = [];
    organizerEventsState.isLoading = false;
    organizerEventsState.isError = false;
    organizerEventsState.error = undefined;
  });

  it("/dashboard shows loading while the current user is loading", () => {
    userState.isLoading = true;

    const html = render(<DashboardPage />);

    expect(html).toContain("Loading dashboard...");
  });

  it("/dashboard participant mode shows error state", () => {
    registrationsState.isError = true;
    registrationsState.error = new Error("Registrations unavailable");

    const html = render(<DashboardPage />);

    expect(html).toContain("Could not load your dashboard");
    expect(html).toContain("Registrations unavailable");
  });

  it("/dashboard participant mode shows empty state and summary content", () => {
    const html = render(<DashboardPage />);

    expect(html).toContain("Recent activity");
    expect(html).toContain("No activity yet");
    expect(html).toContain("Browse events");
  });

  it("/dashboard participant mode shows success content", () => {
    registrationsState.data = {
      items: [
        {
          id: "reg-1",
          eventId: "evt-1",
          eventTitle: "Atlas Summit",
          eventDate: "2026-04-02T09:00:00.000Z",
          status: "CONFIRMED",
          canDownloadTicket: true
        }
      ],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 }
    };

    const html = render(<DashboardPage />);

    expect(html).toContain("Upcoming participation");
    expect(html).toContain("Atlas Summit");
    expect(html).toContain("Open my registrations");
  });

  it("/dashboard organizer mode shows loading and empty states", () => {
    userState.data = { fullName: "Ibrahim", role: "ORGANIZER" };
    organizerEventsState.isLoading = true;

    const loadingHtml = render(<DashboardPage />);
    expect(loadingHtml).toContain("Loading organizer summary...");

    organizerEventsState.isLoading = false;
    const emptyHtml = render(<DashboardPage />);
    expect(emptyHtml).toContain("No managed events yet");
    expect(emptyHtml).toContain("Create event");
  });

  it("/dashboard organizer mode shows success content", () => {
    userState.data = { fullName: "Ibrahim", role: "ORGANIZER" };
    organizerEventsState.data = [
      {
        id: "evt-1",
        title: "Atlas Summit",
        city: "Casablanca",
        startAt: "2026-04-02T09:00:00.000Z",
        status: "PUBLISHED"
      }
    ];

    const html = render(<DashboardPage />);

    expect(html).toContain("Managed events");
    expect(html).toContain("Atlas Summit");
    expect(html).toContain("View registrations");
  });

  it("/dashboard admin mode renders the placeholder summary cards only", () => {
    userState.data = { fullName: "Ibrahim", role: "ADMIN" };

    const html = render(<DashboardPage />);

    expect(html).toContain("Platform operations at a glance");
    expect(html).toContain("User oversight");
    expect(html).toContain("Awaiting backend support");
  });

  it("/my-registrations shows loading and error states", () => {
    registrationsState.isLoading = true;
    const loadingHtml = render(<MyRegistrationsPage />);
    expect(loadingHtml).toContain("Loading registrations...");

    registrationsState.isLoading = false;
    registrationsState.isError = true;
    registrationsState.error = new Error("History unavailable");
    const errorHtml = render(<MyRegistrationsPage />);
    expect(errorHtml).toContain("Could not load registrations");
    expect(errorHtml).toContain("History unavailable");
  });

  it("/my-registrations shows success rendering and empty list handoff", () => {
    const emptyHtml = render(<MyRegistrationsPage />);
    expect(emptyHtml).toContain("Participant history");
    expect(emptyHtml).toContain("registration-list-empty");

    registrationsState.data = {
      items: [
        {
          id: "reg-1",
          eventId: "evt-1",
          eventTitle: "Atlas Summit",
          eventDate: "2026-04-02T09:00:00.000Z",
          status: "CONFIRMED",
          canDownloadTicket: true
        }
      ],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 }
    };

    const successHtml = render(<MyRegistrationsPage />);
    expect(successHtml).toContain("Participant history");
    expect(successHtml).toContain("Page 1 of 1");
    expect(successHtml).toContain("Atlas Summit");
  });
});
