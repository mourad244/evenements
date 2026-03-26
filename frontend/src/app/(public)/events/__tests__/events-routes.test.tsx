import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

type EventsQueryState = {
  data: Array<{
    id: string;
    title: string;
    description: string;
    city: string;
    venue: string;
    theme: string;
    price: number;
    currency: string;
    startAt: string;
    imageUrl?: string;
  }>;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
};

type EventDetailsQueryState = {
  data?:
    | {
        id: string;
        title: string;
        description: string;
        city: string;
        venue: string;
        status: string;
        theme: string;
        price: number;
        currency: string;
        capacity: number;
        startAt: string;
        endAt?: string;
      }
    | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
};

const eventsQueryState: EventsQueryState = {
  data: [],
  isLoading: false,
  isError: false
};

const eventDetailsQueryState: EventDetailsQueryState = {
  data: undefined,
  isLoading: false,
  isError: false
};

vi.mock("next/navigation", () => ({
  useParams: () => ({ eventId: "evt-123" })
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) =>
    React.createElement("a", { href: String(href), ...props }, children)
}));

vi.mock("next/image", () => ({
  default: ({ fill: _fill, alt, ...props }: Record<string, unknown>) =>
    React.createElement("img", { alt: String(alt ?? ""), ...props })
}));

vi.mock("@/features/events/hooks/use-events-query", () => ({
  useEventsQuery: () => eventsQueryState
}));

vi.mock("@/features/events/hooks/use-event-details-query", () => ({
  useEventDetailsQuery: () => eventDetailsQueryState
}));

vi.mock("@/features/registrations/components/registration-button", () => ({
  RegistrationButton: ({ eventId }: { eventId: string }) =>
    React.createElement("div", { "data-testid": "registration-button" }, `Register:${eventId}`)
}));

import EventDetailsPage from "../[eventId]/page";
import EventsPage from "../page";

function render(element: React.ReactElement) {
  return renderToStaticMarkup(element);
}

describe("events routes", () => {
  beforeEach(() => {
    eventsQueryState.data = [];
    eventsQueryState.isLoading = false;
    eventsQueryState.isError = false;
    eventsQueryState.error = undefined;

    eventDetailsQueryState.data = undefined;
    eventDetailsQueryState.isLoading = false;
    eventDetailsQueryState.isError = false;
    eventDetailsQueryState.error = undefined;
  });

  it("/events renders page title and filters", () => {
    const html = render(<EventsPage />);

    expect(html).toContain("Discover events built for ambitious communities.");
    expect(html).toContain("Refine the visible catalog");
    expect(html).toContain("Search visible events");
  });

  it("/events shows loading state while query is pending", () => {
    eventsQueryState.isLoading = true;

    const html = render(<EventsPage />);

    expect(html).toContain("Loading events...");
  });

  it("/events shows error state on query failure", () => {
    eventsQueryState.isError = true;
    eventsQueryState.error = new Error("Catalog unavailable");

    const html = render(<EventsPage />);

    expect(html).toContain("Could not load events");
    expect(html).toContain("Catalog unavailable");
  });

  it("/events shows empty state when no events are returned", () => {
    const html = render(<EventsPage />);

    expect(html).toContain("No events found");
  });

  it("/events shows event cards when data exists", () => {
    eventsQueryState.data = [
      {
        id: "evt-1",
        title: "Atlas Summit",
        description: "Leadership gathering",
        city: "Casablanca",
        venue: "Expo Hall",
        theme: "Leadership",
        price: 0,
        currency: "MAD",
        startAt: "2026-04-02T09:00:00.000Z"
      }
    ];

    const html = render(<EventsPage />);

    expect(html).toContain("Atlas Summit");
    expect(html).toContain("View details");
  });

  it("/events/[eventId] shows loading state", () => {
    eventDetailsQueryState.isLoading = true;

    const html = render(<EventDetailsPage />);

    expect(html).toContain("Loading event details...");
  });

  it("/events/[eventId] shows error state", () => {
    eventDetailsQueryState.isError = true;
    eventDetailsQueryState.error = new Error("Could not reach event service");

    const html = render(<EventDetailsPage />);

    expect(html).toContain("Could not load event details");
    expect(html).toContain("Could not reach event service");
  });

  it("/events/[eventId] shows unavailable state when no event is returned", () => {
    const html = render(<EventDetailsPage />);

    expect(html).toContain("Event not found");
  });

  it("/events/[eventId] shows event details and registration CTA when data exists", () => {
    eventDetailsQueryState.data = {
      id: "evt-123",
      title: "Atlas Summit",
      description: "Leadership gathering",
      city: "Casablanca",
      venue: "Expo Hall",
      status: "PUBLISHED",
      theme: "Leadership",
      price: 0,
      currency: "MAD",
      capacity: 300,
      startAt: "2026-04-02T09:00:00.000Z",
      endAt: "2026-04-02T18:00:00.000Z"
    };

    const html = render(<EventDetailsPage />);

    expect(html).toContain("Atlas Summit");
    expect(html).toContain("Event snapshot");
    expect(html).toContain("Register:evt-123");
  });
});
