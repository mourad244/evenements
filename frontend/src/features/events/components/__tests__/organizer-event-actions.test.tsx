// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

const routerState = {
  pushes: [] as string[]
};

const detailState = {
  data: {
    id: "evt-1",
    title: "Atlas Summit",
    description: "Leadership gathering",
    city: "Casablanca",
    venue: "Expo Hall",
    startAt: "2026-04-02T09:00:00.000Z",
    endAt: "2026-04-02T18:00:00.000Z",
    price: 0,
    currency: "MAD",
    capacity: 300,
    theme: "Leadership",
    status: "DRAFT" as const
  },
  isLoading: false,
  isError: false,
  error: undefined as Error | undefined
};

const updateMutationState = {
  mutateAsync: vi.fn(async () => undefined),
  isPending: false
};

const publishMutationState = {
  mutateAsync: vi.fn(async () => undefined),
  isPending: false
};

const deleteMutationState = {
  mutateAsync: vi.fn(async () => undefined),
  isPending: false
};

vi.mock("next/navigation", () => ({
  useParams: () => ({ eventId: "evt-1" }),
  useRouter: () => ({
    push: (href: string) => routerState.pushes.push(href)
  })
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) =>
    React.createElement("a", { href: String(href), ...props }, children)
}));

vi.mock("@/features/events/hooks/use-organizer-event-details-query", () => ({
  useOrganizerEventDetailsQuery: () => detailState
}));

vi.mock("@/features/events/hooks/use-update-event-mutation", () => ({
  useUpdateEventMutation: () => updateMutationState
}));

vi.mock("@/features/events/hooks/use-publish-event-mutation", () => ({
  usePublishEventMutation: () => publishMutationState
}));

vi.mock("@/features/events/hooks/use-delete-event-mutation", () => ({
  useDeleteEventMutation: () => deleteMutationState
}));

vi.mock("../event-form", () => ({
  EventForm: ({
    submitLabel,
    onSubmit,
    submitDisabled
  }: {
    submitLabel: string;
    submitDisabled?: boolean;
    onSubmit: (values: Record<string, unknown>) => Promise<unknown>;
  }) =>
    React.createElement(
      "button",
      {
        type: "button",
        disabled: submitDisabled,
        onClick: () =>
          onSubmit({
            title: "Atlas Summit",
            description: "Leadership gathering",
            city: "Casablanca",
            venue: "Expo Hall",
            startAt: "2026-04-02T09:00:00.000Z",
            endAt: "2026-04-02T18:00:00.000Z",
            price: 0,
            currency: "MAD",
            capacity: 300,
            theme: "Leadership"
          })
      },
      submitLabel
    )
}));

import OrganizerEventDetailsPage from "@/app/(dashboard)/organizer/events/[eventId]/page";

describe("organizer event action feedback", () => {
  afterEach(() => {
    cleanup();
    routerState.pushes = [];

    detailState.isLoading = false;
    detailState.isError = false;
    detailState.error = undefined;
    detailState.data = {
      id: "evt-1",
      title: "Atlas Summit",
      description: "Leadership gathering",
      city: "Casablanca",
      venue: "Expo Hall",
      startAt: "2026-04-02T09:00:00.000Z",
      endAt: "2026-04-02T18:00:00.000Z",
      price: 0,
      currency: "MAD",
      capacity: 300,
      theme: "Leadership",
      status: "DRAFT"
    };

    updateMutationState.isPending = false;
    updateMutationState.mutateAsync.mockReset();
    updateMutationState.mutateAsync.mockImplementation(async () => undefined);

    publishMutationState.isPending = false;
    publishMutationState.mutateAsync.mockReset();
    publishMutationState.mutateAsync.mockImplementation(async () => undefined);

    deleteMutationState.isPending = false;
    deleteMutationState.mutateAsync.mockReset();
    deleteMutationState.mutateAsync.mockImplementation(async () => undefined);
  });

  it("shows update pending feedback", () => {
    updateMutationState.isPending = true;

    render(<OrganizerEventDetailsPage />);

    expect(screen.getByText("Saving your event changes...")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Updating..." }).hasAttribute("disabled")).toBe(true);
  });

  it("shows update success and error feedback after submit", async () => {
    const { rerender } = render(<OrganizerEventDetailsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Update event" }));
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain("Your event details were saved.")
    );

    updateMutationState.mutateAsync.mockImplementation(async () => {
      throw new Error("Could not save this event");
    });

    rerender(<OrganizerEventDetailsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Update event" }));
    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain("Could not save this event")
    );
  });

  it("shows publish pending, success, and error feedback", async () => {
    publishMutationState.isPending = true;

    const { rerender } = render(<OrganizerEventDetailsPage />);
    expect(screen.getByText("Publishing your event...")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Publishing..." }).hasAttribute("disabled")).toBe(true);

    publishMutationState.isPending = false;
    rerender(<OrganizerEventDetailsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toContain("Your event was published successfully.")
    );

    publishMutationState.mutateAsync.mockImplementation(async () => {
      throw new Error("Publish failed");
    });
    rerender(<OrganizerEventDetailsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Publish" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Publish failed"));
  });

  it("shows delete pending and error feedback", async () => {
    deleteMutationState.isPending = true;

    const { rerender } = render(<OrganizerEventDetailsPage />);
    expect(
      screen.getByText("Deleting this draft and returning to your organizer events...")
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Deleting..." }).hasAttribute("disabled")).toBe(true);

    deleteMutationState.isPending = false;
    deleteMutationState.mutateAsync.mockImplementation(async () => {
      throw new Error("Delete failed");
    });

    rerender(<OrganizerEventDetailsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Delete draft" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Delete failed"));
  });
});
