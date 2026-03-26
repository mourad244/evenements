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

describe("Sprint 3 participant history polish", () => {
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

  it("/my-registrations shows Sprint 3 summary cards and registration explanations", () => {
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

    expect(html).toContain("Confirmed on this page");
    expect(html).toContain("Waitlisted on this page");
    expect(html).toContain("Ticket-ready on this page");
    expect(html).toContain("Latest update on this page");
    expect(html).toContain("Registration confirmed");
    expect(html).toContain("Currently waitlisted");
    expect(html).toContain("Your ticket record is ready.");
    expect(html).toContain("Current waitlist position: 3");
    expect(html).toContain("Updated");
    expect(html).toContain("Ticket reference:");
  });

  it("/dashboard participant mode shows Sprint 3 next-action guidance and recent activity ordering", () => {
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

    expect(html).toContain("What to focus on now");
    expect(html).toContain("Open my registrations");
    expect(html).toContain("Review event");
    expect(html).toContain("Active registrations");
    expect(html).toContain("Recent activity");
    expect(html).toContain("Updated");
  });

  it("/dashboard participant mode shows improved empty-state guidance with browse and history paths", () => {
    const html = render(<DashboardPage />);

    expect(html).toContain("Find your next event");
    expect(html).toContain("Browse events");
    expect(html).toContain("Open history");
    expect(html).toContain("No activity yet");
  });
});
