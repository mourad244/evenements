import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

type UsersState = {
  data?: Array<{ id: string; fullName: string; email: string; role: string; createdAt: string }>;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
};

type EventsState = {
  data?: Array<{ id: string; title: string; city: string; startAt: string; status: string }>;
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

vi.mock("@/features/admin/components/users-table", () => ({
  UsersTable: ({ users }: { users: Array<{ fullName: string }> }) =>
    React.createElement("div", { "data-testid": "users-table" }, users.map((u) => u.fullName).join(", "))
}));

vi.mock("@/features/admin/components/admin-events-table", () => ({
  AdminEventsTable: ({ events }: { events: Array<{ title: string }> }) =>
    React.createElement("div", { "data-testid": "admin-events-table" }, events.map((e) => e.title).join(", "))
}));

import AdminEventsPage from "../events/page";
import AdminUsersPage from "../users/page";

function render(element: React.ReactElement) {
  return renderToStaticMarkup(element);
}

describe("admin routes", () => {
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

  it("/admin/users shows loading, error, empty, and success states", () => {
    usersState.isLoading = true;
    const loadingHtml = render(<AdminUsersPage />);
    expect(loadingHtml).toContain("Loading admin users...");

    usersState.isLoading = false;
    usersState.isError = true;
    usersState.error = new Error("User directory unavailable");
    const errorHtml = render(<AdminUsersPage />);
    expect(errorHtml).toContain("Could not load admin users");
    expect(errorHtml).toContain("User directory unavailable");

    usersState.isError = false;
    const emptyHtml = render(<AdminUsersPage />);
    expect(emptyHtml).toContain("No users available");

    usersState.data = [
      {
        id: "usr-1",
        fullName: "Ibrahim Benlamkadem",
        email: "ibrahim@example.com",
        role: "ADMIN",
        createdAt: "2026-03-01T09:00:00.000Z"
      }
    ];
    const successHtml = render(<AdminUsersPage />);
    expect(successHtml).toContain("Ibrahim Benlamkadem");
  });

  it("/admin/events shows loading, error, unavailable, and success states", () => {
    adminEventsState.isLoading = true;
    const loadingHtml = render(<AdminEventsPage />);
    expect(loadingHtml).toContain("Loading admin events...");

    adminEventsState.isLoading = false;
    adminEventsState.isError = true;
    adminEventsState.error = new Error("Admin event overview unavailable");
    const errorHtml = render(<AdminEventsPage />);
    expect(errorHtml).toContain("Could not load admin events");
    expect(errorHtml).toContain("Admin event overview unavailable");

    adminEventsState.isError = false;
    const unavailableHtml = render(<AdminEventsPage />);
    expect(unavailableHtml).toContain("No events available");
    expect(unavailableHtml).toContain("Limited event overview");

    adminEventsState.data = [
      {
        id: "evt-1",
        title: "Atlas Summit",
        city: "Casablanca",
        startAt: "2026-04-02T09:00:00.000Z",
        status: "PUBLISHED"
      }
    ];
    const successHtml = render(<AdminEventsPage />);
    expect(successHtml).toContain("Limited event overview");
    expect(successHtml).toContain("Atlas Summit");
  });
});
