// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

type UserState = {
  data?: { fullName: string; role: "PARTICIPANT" | "ORGANIZER" | "ADMIN" } | null;
};

type NotificationsState = {
  data?: {
    items: Array<{
      id: string;
      title: string;
      message: string;
      type: string;
      isRead: boolean;
      createdAt: string;
      readAt?: string | null;
    }>;
    pagination: { page: number; pageSize: number; total: number; totalPages: number };
  };
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  isFetching?: boolean;
};

type MutationState = {
  mutate: (id: string) => void;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  variables?: string;
};

const routerState = {
  replace: vi.fn()
};

const searchParamsState = {
  params: new URLSearchParams("")
};

const userState: UserState = {
  data: { fullName: "Ibrahim", role: "PARTICIPANT" }
};

const notificationsState: NotificationsState = {
  data: {
    items: [],
    pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 }
  },
  isLoading: false,
  isError: false,
  isFetching: false
};

const markReadState: MutationState = {
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
  variables: undefined
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerState.replace }),
  useSearchParams: () => searchParamsState.params,
  usePathname: () => "/notifications"
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) =>
    React.createElement("a", { href: String(href), ...props }, children)
}));

vi.mock("@/components/guards/role-guard", () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children)
}));

vi.mock("@/features/auth/hooks/use-current-user", () => ({
  useCurrentUser: () => userState
}));

vi.mock("@/features/notifications/hooks/use-notifications-query", () => ({
  useNotificationsQuery: () => notificationsState
}));

vi.mock("@/features/notifications/hooks/use-mark-notification-read-mutation", () => ({
  useMarkNotificationReadMutation: () => markReadState
}));

import NotificationsPage from "../page";

describe("notifications pagination UX", () => {
  beforeEach(() => {
    routerState.replace.mockClear();
    searchParamsState.params = new URLSearchParams("");
    notificationsState.data = {
      items: [],
      pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 }
    };
    notificationsState.isLoading = false;
    notificationsState.isError = false;
    notificationsState.error = undefined;
    notificationsState.isFetching = false;
    markReadState.mutate = vi.fn();
    markReadState.isPending = false;
    markReadState.isError = false;
    markReadState.error = null;
    markReadState.variables = undefined;
  });

  it("renders paginated notifications with correct summary and controls", () => {
    searchParamsState.params = new URLSearchParams("page=2&pageSize=10");
    notificationsState.data = {
      items: [
        {
          id: "notif-1",
          title: "Registration confirmed",
          message: "You are confirmed for Atlas Summit.",
          type: "REGISTRATION_CONFIRMED",
          isRead: false,
          createdAt: "2026-03-20T10:00:00.000Z"
        },
        {
          id: "notif-2",
          title: "Event published",
          message: "Your event is live in the catalog.",
          type: "EVENT_PUBLISHED",
          isRead: true,
          createdAt: "2026-03-19T10:00:00.000Z",
          readAt: "2026-03-20T12:00:00.000Z"
        }
      ],
      pagination: { page: 2, pageSize: 10, total: 25, totalPages: 3 }
    };

    render(<NotificationsPage />);

    expect(screen.getByText("Showing 11–20 of 25 updates.")).toBeTruthy();
    expect(screen.getByText("Registration confirmed")).toBeTruthy();
    expect(screen.getByText("Event published")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Previous" }).hasAttribute("disabled")).toBe(false);
    expect(screen.getByRole("button", { name: "Next" }).hasAttribute("disabled")).toBe(false);
  });

  it("disables pagination controls on first/last pages", () => {
    searchParamsState.params = new URLSearchParams("page=1&pageSize=10");
    notificationsState.data = {
      items: [
        {
          id: "notif-3",
          title: "Waitlist update",
          message: "You moved up on the waitlist.",
          type: "WAITLIST_PROMOTED",
          isRead: false,
          createdAt: "2026-03-21T10:00:00.000Z"
        }
      ],
      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 }
    };

    render(<NotificationsPage />);

    expect(screen.getByRole("button", { name: "Previous" }).hasAttribute("disabled")).toBe(true);
    expect(screen.getByRole("button", { name: "Next" }).hasAttribute("disabled")).toBe(true);
  });

  it("marks notifications as read and updates the UI state", () => {
    notificationsState.data = {
      items: [
        {
          id: "notif-4",
          title: "Registration confirmed",
          message: "You are confirmed for Summit.",
          type: "REGISTRATION_CONFIRMED",
          isRead: false,
          createdAt: "2026-03-22T10:00:00.000Z"
        }
      ],
      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 }
    };

    const { rerender } = render(<NotificationsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Mark as read" }));
    expect(markReadState.mutate).toHaveBeenCalledWith("notif-4");

    notificationsState.data = {
      items: [
        {
          id: "notif-4",
          title: "Registration confirmed",
          message: "You are confirmed for Summit.",
          type: "REGISTRATION_CONFIRMED",
          isRead: true,
          createdAt: "2026-03-22T10:00:00.000Z",
          readAt: "2026-03-22T12:00:00.000Z"
        }
      ],
      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 }
    };
    rerender(<NotificationsPage />);

    expect(screen.getByText("Read")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Already read" }).hasAttribute("disabled")).toBe(true);
  });
});
