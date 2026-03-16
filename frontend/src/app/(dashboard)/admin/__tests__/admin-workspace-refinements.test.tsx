import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

type UsersState = {
  data?: Array<{
    id: string;
    fullName: string;
    email: string;
    role: "ADMIN" | "ORGANIZER" | "PARTICIPANT";
    createdAt: string;
  }>;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
};

type EventsState = {
  data?: Array<{
    id: string;
    title: string;
    description: string;
    city: string;
    venue: string;
    startAt: string;
    status: "DRAFT" | "PUBLISHED" | "CANCELLED";
    price: number;
    currency: string;
    capacity: number;
    theme: string;
  }>;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
};

const usersState: UsersState = {
  data: [],
  isLoading: false,
  isError: false
};

const adminEventsState: EventsState = {
  data: [],
  isLoading: false,
  isError: false
};

vi.mock("@/features/admin/hooks/use-users-query", () => ({
  useUsersQuery: () => usersState
}));

vi.mock("@/features/admin/hooks/use-admin-events-query", () => ({
  useAdminEventsQuery: () => adminEventsState
}));

import AdminEventsPage from "../events/page";
import AdminUsersPage from "../users/page";

function render(element: React.ReactElement) {
  return renderToStaticMarkup(element);
}

describe("admin workspace refinements", () => {
  beforeEach(() => {
    usersState.data = [];
    usersState.isLoading = false;
    usersState.isError = false;
    usersState.error = undefined;

    adminEventsState.data = [];
    adminEventsState.isLoading = false;
    adminEventsState.isError = false;
    adminEventsState.error = undefined;
  });

  it("/admin/users shows the reading guide and role interpretation blocks", () => {
    usersState.data = [
      {
        id: "usr-1",
        fullName: "Ibrahim Benlamkadem",
        email: "ibrahim@example.com",
        role: "ADMIN",
        createdAt: "2026-03-01T09:00:00.000Z"
      },
      {
        id: "usr-2",
        fullName: "Sara Bennani",
        email: "sara@example.com",
        role: "ORGANIZER",
        createdAt: "2026-03-02T09:00:00.000Z"
      },
      {
        id: "usr-3",
        fullName: "Youssef Idrissi",
        email: "youssef@example.com",
        role: "PARTICIPANT",
        createdAt: "2026-03-03T09:00:00.000Z"
      }
    ];

    const html = render(<AdminUsersPage />);

    expect(html).toContain("Admin reading guide");
    expect(html).toContain("Summary first, directory second");
    expect(html).toContain("High-access account");
    expect(html).toContain("Event workspace account");
    expect(html).toContain("Participant account");
    expect(html).toContain("The role summaries above match the rows below.");
  });

  it("/admin/events shows the limited-overview guide, lifecycle interpretation blocks, and explicit limited framing", () => {
    adminEventsState.data = [
      {
        id: "evt-1",
        title: "Atlas Summit",
        description: "Leadership gathering",
        city: "Casablanca",
        venue: "Expo Hall",
        startAt: "2026-04-02T09:00:00.000Z",
        status: "DRAFT",
        price: 0,
        currency: "MAD",
        capacity: 300,
        theme: "Leadership"
      },
      {
        id: "evt-2",
        title: "Design Circle",
        description: "Community meetup",
        city: "Rabat",
        venue: "Studio One",
        startAt: "2026-05-02T09:00:00.000Z",
        status: "PUBLISHED",
        price: 0,
        currency: "MAD",
        capacity: 120,
        theme: "Design"
      },
      {
        id: "evt-3",
        title: "Past Forum",
        description: "Archived state sample",
        city: "Marrakesh",
        venue: "Forum Hall",
        startAt: "2026-06-02T09:00:00.000Z",
        status: "CANCELLED",
        price: 0,
        currency: "MAD",
        capacity: 100,
        theme: "Business"
      }
    ];

    const html = render(<AdminEventsPage />);

    expect(html).toContain("Limited overview guide");
    expect(html).toContain("Counts and rows stay intentionally narrow");
    expect(html).toContain("Preparation stage");
    expect(html).toContain("Live to participants");
    expect(html).toContain("Review-only state");
    expect(html).toContain("Use this table for quick event identity and lifecycle review only. It is intentionally narrow and not a full event-management workspace.");
  });
});
