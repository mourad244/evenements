import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

type OrganizerEventsState = {
  data?: Array<{
    id: string;
    title: string;
    description: string;
    city: string;
    venue: string;
    theme: string;
    price: number;
    currency: string;
    capacity: number;
    startAt: string;
    status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  }>;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
};

type OrganizerEventDetailsState = {
  data?: {
    id: string;
    title: string;
    description: string;
    city: string;
    venue: string;
    startAt: string;
    endAt: string;
    price: number;
    currency: string;
    capacity: number;
    theme: string;
    status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  };
  isLoading: boolean;
  isError: boolean;
  error?: Error;
};

type OrganizerRegistrationsState = {
  data?: {
    eventTitle: string;
    registrations: Array<{
      id: string;
      participantName: string;
      status: "CONFIRMED" | "WAITLISTED" | "CANCELLED" | "REJECTED";
      ticketRef: string | null;
    }>;
  };
  isLoading: boolean;
  isError: boolean;
  error?: Error;
};

const organizerEventsState: OrganizerEventsState = {
  data: [],
  isLoading: false,
  isError: false
};

const organizerEventDetailsState: OrganizerEventDetailsState = {
  data: undefined,
  isLoading: false,
  isError: false
};

const organizerRegistrationsState: OrganizerRegistrationsState = {
  data: undefined,
  isLoading: false,
  isError: false
};

const mutationState = {
  updatePending: false,
  publishPending: false,
  deletePending: false
};

vi.mock("next/navigation", () => ({
  useParams: () => ({ eventId: "evt-1" }),
  useRouter: () => ({ push: vi.fn() })
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) =>
    React.createElement("a", { href: String(href), ...props }, children)
}));

vi.mock("@/features/events/hooks/use-organizer-events-query", () => ({
  useOrganizerEventsQuery: () => organizerEventsState
}));

vi.mock("@/features/events/hooks/use-organizer-event-details-query", () => ({
  useOrganizerEventDetailsQuery: () => organizerEventDetailsState
}));

vi.mock("@/features/registrations/hooks/use-organizer-event-registrations-query", () => ({
  useOrganizerEventRegistrationsQuery: () => organizerRegistrationsState
}));

vi.mock("@/features/events/hooks/use-update-event-mutation", () => ({
  useUpdateEventMutation: () => ({ mutateAsync: vi.fn(), isPending: mutationState.updatePending })
}));

vi.mock("@/features/events/hooks/use-publish-event-mutation", () => ({
  usePublishEventMutation: () => ({ mutateAsync: vi.fn(), isPending: mutationState.publishPending })
}));

vi.mock("@/features/events/hooks/use-delete-event-mutation", () => ({
  useDeleteEventMutation: () => ({ mutateAsync: vi.fn(), isPending: mutationState.deletePending })
}));

vi.mock("@/features/events/components/event-form", () => ({
  EventForm: ({ submitLabel }: { submitLabel: string }) =>
    React.createElement("div", { "data-testid": "event-form" }, `event-form:${submitLabel}`)
}));

import OrganizerEventDetailsPage from "../[eventId]/page";
import OrganizerEventRegistrationsPage from "../[eventId]/registrations/page";
import OrganizerEventsPage from "../page";

function render(element: React.ReactElement) {
  return renderToStaticMarkup(element);
}

describe("Sprint 3 organizer polish", () => {
  beforeEach(() => {
    organizerEventsState.data = [];
    organizerEventsState.isLoading = false;
    organizerEventsState.isError = false;
    organizerEventsState.error = undefined;

    organizerEventDetailsState.data = undefined;
    organizerEventDetailsState.isLoading = false;
    organizerEventDetailsState.isError = false;
    organizerEventDetailsState.error = undefined;

    organizerRegistrationsState.data = undefined;
    organizerRegistrationsState.isLoading = false;
    organizerRegistrationsState.isError = false;
    organizerRegistrationsState.error = undefined;

    mutationState.updatePending = false;
    mutationState.publishPending = false;
    mutationState.deletePending = false;
  });

  it("/organizer/events shows Sprint 3 summary cards, grouping, and row CTA labels", () => {
    organizerEventsState.data = [
      {
        id: "evt-1",
        title: "Atlas Summit",
        description: "Leadership gathering",
        city: "Casablanca",
        venue: "Expo Hall",
        theme: "Leadership",
        price: 0,
        currency: "MAD",
        capacity: 300,
        startAt: "2026-04-02T09:00:00.000Z",
        status: "DRAFT"
      },
      {
        id: "evt-2",
        title: "Design Circle",
        description: "Community meetup",
        city: "Rabat",
        venue: "Studio One",
        theme: "Design",
        price: 0,
        currency: "MAD",
        capacity: 120,
        startAt: "2026-05-01T09:00:00.000Z",
        status: "PUBLISHED"
      },
      {
        id: "evt-3",
        title: "Past Forum",
        description: "Archived state sample",
        city: "Marrakesh",
        venue: "Forum Hall",
        theme: "Business",
        price: 0,
        currency: "MAD",
        capacity: 200,
        startAt: "2026-06-01T09:00:00.000Z",
        status: "CANCELLED"
      }
    ];

    const html = render(<OrganizerEventsPage />);

    expect(html).toContain("Draft events");
    expect(html).toContain("Published events");
    expect(html).toContain("Total managed events");
    expect(html).toContain("Drafts to finish");
    expect(html).toContain("Published events");
    expect(html).toContain("Other event states");
    expect(html).toContain("Continue draft");
    expect(html).toContain("Open event");
    expect(html).toContain("Registrations");
  });

  it("/organizer/events/[eventId] shows event-state summary and organizer updates area", () => {
    organizerEventDetailsState.data = {
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
    mutationState.publishPending = true;

    const html = render(<OrganizerEventDetailsPage />);

    expect(html).toContain("Draft event");
    expect(html).toContain("This event is still being prepared");
    expect(html).toContain("Starts");
    expect(html).toContain("300 seats");
    expect(html).toContain("Organizer updates");
    expect(html).toContain("Publishing your event...");
    expect(html).toContain("event-form:Update event");
  });

  it("/organizer/events/[eventId]/registrations shows improved hierarchy, status explanation, and ticket readiness", () => {
    organizerRegistrationsState.data = {
      eventTitle: "Atlas Summit",
      registrations: [
        {
          id: "reg-1",
          participantName: "Sara Bennani",
          status: "CONFIRMED",
          ticketRef: "TCK-001"
        },
        {
          id: "reg-2",
          participantName: "Youssef Idrissi",
          status: "WAITLISTED",
          ticketRef: null
        }
      ]
    };

    const html = render(<OrganizerEventRegistrationsPage />);

    expect(html).toContain("Confirmed participation");
    expect(html).toContain("Waitlisted");
    expect(html).toContain("Ticket reference available");
    expect(html).toContain("Waiting for confirmation");
    expect(html).toContain("Registration ID: reg-1");
    expect(html).toContain("Visible ticket reference for organizer review.");
    expect(html).toContain("A reference will appear here once it has been issued.");
  });
});
