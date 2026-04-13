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
      eventCity?: string | null;
      status: "CONFIRMED" | "WAITLISTED" | "CANCELLED" | "REJECTED";
      canDownloadTicket?: boolean;
      ticketId?: string | null;
      ticketFormat?: string | null;
      updatedAt?: string | null;
      waitlistPosition?: number | null;
    }>;
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  };
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  isFetching?: boolean;
};

const userState: UserState = {
  data: { fullName: "Ibrahim", role: "PARTICIPANT" },
  isLoading: false
};

const registrationsState: RegistrationsState = {
  data: {
    items: [],
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 1 }
  },
  isLoading: false,
  isError: false,
  isFetching: false
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

vi.mock("@/components/guards/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children)
}));

vi.mock("@/features/auth/hooks/use-current-user", () => ({
  useCurrentUser: () => userState
}));

vi.mock("@/features/registrations/hooks/use-my-registrations-query", () => ({
  useMyRegistrationsQuery: () => registrationsState
}));

vi.mock("@/features/registrations/hooks/use-cancel-registration-mutation", () => ({
  useCancelRegistrationMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    isSuccess: false,
    error: null,
    variables: undefined
  })
}));

vi.mock("@/features/events/hooks/use-organizer-events-query", () => ({
  useOrganizerEventsQuery: () => ({
    data: [],
    isLoading: false,
    isError: false,
    error: undefined
  })
}));

import DashboardPage from "../dashboard/page";
import MyRegistrationsPage from "../my-registrations/page";

function render(element: React.ReactElement) {
  return renderToStaticMarkup(element);
}

describe("participant refinements", () => {
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
  });

  it("/my-registrations shows the new guidance card, summary note, next-step guidance, and ticket wording", () => {
    registrationsState.data = {
      items: [
        {
          id: "reg-1",
          eventId: "evt-1",
          eventTitle: "Atlas Summit",
          eventDate: "2026-04-02T09:00:00.000Z",
          eventCity: "Casablanca",
          status: "CONFIRMED",
          canDownloadTicket: false,
          ticketId: null,
          ticketFormat: null,
          updatedAt: "2026-03-18T12:00:00.000Z",
          waitlistPosition: null
        },
        {
          id: "reg-2",
          eventId: "evt-2",
          eventTitle: "Design Circle",
          eventDate: "2026-04-10T09:00:00.000Z",
          eventCity: "Rabat",
          status: "WAITLISTED",
          canDownloadTicket: false,
          ticketId: null,
          ticketFormat: null,
          updatedAt: "2026-03-19T10:00:00.000Z",
          waitlistPosition: 3
        }
      ],
      pagination: { page: 1, pageSize: 20, total: 2, totalPages: 1 }
    };

    const html = render(<MyRegistrationsPage />);

    expect(html).toContain("Participant guidance");
    expect(html).toContain("Open dashboard");
    expect(html).toContain("Browse events");
    expect(html).toContain("Use the dashboard for next-step guidance, then return here for the full record.");
    expect(html).toContain("What to do next");
    expect(html).toContain("Check back for ticket readiness");
    expect(html).toContain("Watch for movement");
    expect(html).toContain("Ticket pending issuance");
    expect(html).toContain("Ticket unavailable while waitlisted");
  });

  it("/dashboard participant mode shows quick-glance chips, ticket-ready summary, and confirmed CTA selection", () => {
    registrationsState.data = {
      items: [
        {
          id: "reg-1",
          eventId: "evt-1",
          eventTitle: "Atlas Summit",
          eventDate: "2026-04-02T09:00:00.000Z",
          eventCity: "Casablanca",
          status: "CONFIRMED",
          canDownloadTicket: true,
          ticketId: "TCK-1001",
          ticketFormat: "PDF",
          updatedAt: "2026-03-20T09:00:00.000Z",
          waitlistPosition: null
        },
        {
          id: "reg-2",
          eventId: "evt-2",
          eventTitle: "Design Circle",
          eventDate: "2026-04-10T09:00:00.000Z",
          eventCity: "Rabat",
          status: "WAITLISTED",
          canDownloadTicket: false,
          ticketId: null,
          ticketFormat: null,
          updatedAt: "2026-03-18T09:00:00.000Z",
          waitlistPosition: 2
        }
      ],
      pagination: { page: 1, pageSize: 20, total: 2, totalPages: 1 }
    };

    const html = render(<DashboardPage />);

    expect(html).toContain("Active registrations:");
    expect(html).toContain("Ticket-ready:");
    expect(html).toContain("Waitlisted:");
    expect(html).toContain("Ticket-ready now");
    expect(html).toContain("Confirmed place with ticket details already visible in your history.");
    expect(html).toContain("Open my registrations");
    expect(html).toContain("Review event");
  });

  it("/dashboard participant mode keeps browse-events guidance when there is no active registration", () => {
    const html = render(<DashboardPage />);

    expect(html).toContain("Find your next event");
    expect(html).toContain("Browse events");
    expect(html).toContain("Open history");
  });
});
