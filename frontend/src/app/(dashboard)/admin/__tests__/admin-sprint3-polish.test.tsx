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

describe("Sprint 3 admin polish", () => {
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

  it("/admin/users shows summary cards and improved row hierarchy", () => {
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

    expect(html).toContain("Total users");
    expect(html).toContain("Admins");
    expect(html).toContain("Organizers");
    expect(html).toContain("Participants");
    expect(html).toContain("User directory");
    expect(html).toContain("User identity");
    expect(html).toContain("Access role");
    expect(html).toContain("User ID: usr-1");
    expect(html).toContain("High-access account");
    expect(html).toContain("Account creation date");
  });

  it("/admin/events shows summary cards, limited-overview notice, and improved row hierarchy", () => {
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
      }
    ];

    const html = render(<AdminEventsPage />);

    expect(html).toContain("Admin limitation notice");
    expect(html).toContain("Limited event overview");
    expect(html).toContain("Visible events");
    expect(html).toContain("Draft events");
    expect(html).toContain("Published events");
    expect(html).toContain("Limited event directory");
    expect(html).toContain("Event identity");
    expect(html).toContain("Location");
    expect(html).toContain("Scheduled date");
    expect(html).toContain("Lifecycle");
    expect(html).toContain("Event ID: evt-1");
    expect(html).toContain("Preparation stage");
  });
});
