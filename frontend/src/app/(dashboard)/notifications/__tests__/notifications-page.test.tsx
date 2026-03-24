// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";

type NotificationsState = {
  data: {
    items: Array<{
      id: string;
      notificationId: string;
      title: string;
      message: string | null;
      type: string;
      isRead: boolean;
      createdAt: string;
      readAt: string | null;
    }>;
    page: number;
    pageSize: number;
    total: number;
  };
  isLoading: boolean;
  isError: boolean;
  error?: Error;
};

type MarkReadState = {
  mutate: (id: string) => void;
  isPending: boolean;
  variables?: string;
  error: Error | null;
};

const notificationsState: NotificationsState = {
  data: {
    items: [
      {
        id: "notif-1",
        notificationId: "notif-1",
        title: "Registration confirmed",
        message: "Your registration is confirmed.",
        type: "REGISTRATION_CONFIRMED",
        isRead: false,
        createdAt: "2026-04-02T09:00:00.000Z",
        readAt: null
      },
      {
        id: "notif-2",
        notificationId: "notif-2",
        title: "Event published",
        message: "Your event is live.",
        type: "EVENT_PUBLISHED",
        isRead: true,
        createdAt: "2026-04-03T09:00:00.000Z",
        readAt: "2026-04-03T10:00:00.000Z"
      }
    ],
    page: 1,
    pageSize: 2,
    total: 3
  },
  isLoading: false,
  isError: false,
  error: undefined
};

const markReadState: MarkReadState = {
  mutate: () => undefined,
  isPending: false,
  variables: undefined,
  error: null
};

vi.mock("@/features/notifications/hooks/use-notifications-query", () => ({
  useNotificationsQuery: () => notificationsState
}));

vi.mock("@/features/notifications/hooks/use-mark-notification-read-mutation", () => ({
  useMarkNotificationReadMutation: () => markReadState
}));

import NotificationsPage from "../page";

function resetNotificationsData() {
  notificationsState.data = {
    items: [
      {
        id: "notif-1",
        notificationId: "notif-1",
        title: "Registration confirmed",
        message: "Your registration is confirmed.",
        type: "REGISTRATION_CONFIRMED",
        isRead: false,
        createdAt: "2026-04-02T09:00:00.000Z",
        readAt: null
      },
      {
        id: "notif-2",
        notificationId: "notif-2",
        title: "Event published",
        message: "Your event is live.",
        type: "EVENT_PUBLISHED",
        isRead: true,
        createdAt: "2026-04-03T09:00:00.000Z",
        readAt: "2026-04-03T10:00:00.000Z"
      }
    ],
    page: 1,
    pageSize: 2,
    total: 3
  };
}

describe("notifications page", () => {
  afterEach(() => {
    cleanup();
    notificationsState.isLoading = false;
    notificationsState.isError = false;
    notificationsState.error = undefined;
    markReadState.isPending = false;
    markReadState.variables = undefined;
    markReadState.error = null;
    resetNotificationsData();
  });

  it("renders notifications and read/unread states", () => {
    render(<NotificationsPage />);

    expect(screen.getByText("Registration confirmed")).toBeTruthy();
    expect(screen.getByText("Event published")).toBeTruthy();
    expect(screen.getAllByText("Unread").length).toBe(1);
    expect(screen.getAllByText("Read").length).toBe(1);
  });

  it("marks a notification as read", () => {
    const mutateSpy = vi.fn((id: string) => {
      markReadState.variables = id;
      notificationsState.data.items = notificationsState.data.items.map((item) =>
        item.notificationId === id
          ? { ...item, isRead: true, readAt: "2026-04-04T09:00:00.000Z" }
          : item
      );
    });
    markReadState.mutate = mutateSpy;

    const { rerender } = render(<NotificationsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Mark as read" }));
    expect(mutateSpy).toHaveBeenCalledWith("notif-1");

    rerender(<NotificationsPage />);

    expect(screen.getAllByText("Read").length).toBe(2);
  });

  it("renders pagination summary and enables controls correctly", () => {
    render(<NotificationsPage />);

    expect(screen.getByText("Showing 1-2 of 3")).toBeTruthy();
    expect(screen.getByText("Page 1 of 2")).toBeTruthy();
    const prevButton = screen.getByRole("button", { name: "Previous" });
    const nextButton = screen.getByRole("button", { name: "Next" });
    expect((prevButton as HTMLButtonElement).disabled).toBe(true);
    expect((nextButton as HTMLButtonElement).disabled).toBe(false);
  });

  it("updates page summary and controls when moving to the next page", () => {
    const { rerender } = render(<NotificationsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    notificationsState.data = {
      items: [
        {
          id: "notif-3",
          notificationId: "notif-3",
          title: "Waitlist promoted",
          message: "You have been promoted from the waitlist.",
          type: "WAITLIST_PROMOTED",
          isRead: false,
          createdAt: "2026-04-04T09:00:00.000Z",
          readAt: null
        }
      ],
      page: 2,
      pageSize: 2,
      total: 3
    };

    rerender(<NotificationsPage />);

    expect(screen.getByText("Showing 3-3 of 3")).toBeTruthy();
    expect(screen.getByText("Page 2 of 2")).toBeTruthy();
    const prevButton = screen.getByRole("button", { name: "Previous" });
    const nextButton = screen.getByRole("button", { name: "Next" });
    expect((prevButton as HTMLButtonElement).disabled).toBe(false);
    expect((nextButton as HTMLButtonElement).disabled).toBe(true);
  });
});
