import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

type OrganizerEventsState = {
  data?: Array<{
    id: string;
    title: string;
    description?: string;
    city: string;
    venue?: string;
    theme?: string;
    price?: number;
    currency?: string;
    startAt: string;
    imageUrl?: string;
    status: "DRAFT" | "PUBLISHED";
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
    status: "DRAFT" | "PUBLISHED";
  };
  isLoading: boolean;
  isError: boolean;
  error?: Error;
};

type OrganizerRegistrationsState = {
  data?:
    | {
        eventTitle: string;
        registrations: Array<{
          id: string;
          participantName: string;
          status: string;
          ticketRef: string | null;
        }>;
      }
    | undefined;
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

const organizerExportMutationState = {
  mutate: vi.fn(),
  isPending: false,
  isSuccess: false,
  error: null as Error | null,
  data: undefined as { filename: string } | undefined
};

const routerState = {
  pushes: [] as string[]
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

vi.mock("@/features/events/hooks/use-organizer-events-query", () => ({
  useOrganizerEventsQuery: () => organizerEventsState
}));

vi.mock("@/features/events/hooks/use-organizer-event-details-query", () => ({
  useOrganizerEventDetailsQuery: () => organizerEventDetailsState
}));

vi.mock("@/features/registrations/hooks/use-organizer-event-registrations-query", () => ({
  useOrganizerEventRegistrationsQuery: () => organizerRegistrationsState
}));

vi.mock("@/features/registrations/hooks/use-download-organizer-registrations-export-mutation", () => ({
  useDownloadOrganizerRegistrationsExportMutation: () => organizerExportMutationState
}));

vi.mock("@/features/events/hooks/use-update-event-mutation", () => ({
  useUpdateEventMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false
  })
}));

vi.mock("@/features/events/hooks/use-publish-event-mutation", () => ({
  usePublishEventMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false
  })
}));

vi.mock("@/features/events/hooks/use-delete-event-mutation", () => ({
  useDeleteEventMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false
  })
}));

vi.mock("@/features/events/components/event-form", () => ({
  EventForm: ({ submitLabel }: { submitLabel: string }) =>
    React.createElement("div", { "data-testid": "event-form" }, `event-form:${submitLabel}`)
}));

vi.mock("@/features/events/components/event-list", () => ({
  EventList: ({ events }: { events: Array<{ title: string }> }) =>
    React.createElement("div", { "data-testid": "event-list" }, events.map((e) => e.title).join(", "))
}));

vi.mock("@/features/registrations/components/organizer-registrations-list", () => ({
  OrganizerRegistrationsList: ({
    eventTitle,
    registrations
  }: {
    eventTitle: string;
    registrations: Array<{ participantName: string }>;
  }) =>
    React.createElement(
      "div",
      { "data-testid": "organizer-registrations-list" },
      `${eventTitle}:${registrations.map((item) => item.participantName).join(", ")}`
    )
}));

import OrganizerEventDetailsPage from "../[eventId]/page";
import OrganizerEventRegistrationsPage from "../[eventId]/registrations/page";
import OrganizerEventsPage from "../page";

function render(element: React.ReactElement) {
  return renderToStaticMarkup(element);
}

describe("organizer routes", () => {
  beforeEach(() => {
    routerState.pushes = [];

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

    organizerExportMutationState.mutate.mockReset();
    organizerExportMutationState.isPending = false;
    organizerExportMutationState.isSuccess = false;
    organizerExportMutationState.error = null;
    organizerExportMutationState.data = undefined;
  });

  it("/organizer/events shows loading, error, empty, and success states", () => {
    organizerEventsState.isLoading = true;
    const loadingHtml = render(<OrganizerEventsPage />);
    expect(loadingHtml).toContain("Loading organizer events...");

    organizerEventsState.isLoading = false;
    organizerEventsState.isError = true;
    organizerEventsState.error = new Error("Organizer events unavailable");
    const errorHtml = render(<OrganizerEventsPage />);
    expect(errorHtml).toContain("Could not load organizer events");
    expect(errorHtml).toContain("Organizer events unavailable");

    organizerEventsState.isError = false;
    const emptyHtml = render(<OrganizerEventsPage />);
    expect(emptyHtml).toContain("No organizer events yet");
    expect(emptyHtml).toContain("Create event");

    organizerEventsState.data = [
      {
        id: "evt-1",
        title: "Atlas Summit",
        city: "Casablanca",
        startAt: "2026-04-02T09:00:00.000Z",
        status: "DRAFT"
      }
    ];
    const successHtml = render(<OrganizerEventsPage />);
    expect(successHtml).toContain("Atlas Summit");
  });

  it("/organizer/events/[eventId] shows loading, error, and unavailable states", () => {
    organizerEventDetailsState.isLoading = true;
    const loadingHtml = render(<OrganizerEventDetailsPage />);
    expect(loadingHtml).toContain("Loading event...");

    organizerEventDetailsState.isLoading = false;
    organizerEventDetailsState.isError = true;
    organizerEventDetailsState.error = new Error("Event detail unavailable");
    const errorHtml = render(<OrganizerEventDetailsPage />);
    expect(errorHtml).toContain("Could not load event");
    expect(errorHtml).toContain("Event detail unavailable");

    organizerEventDetailsState.isError = false;
    const unavailableHtml = render(<OrganizerEventDetailsPage />);
    expect(unavailableHtml).toContain("Event unavailable");
  });

  it("/organizer/events/[eventId] shows success content", () => {
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

    const html = render(<OrganizerEventDetailsPage />);

    expect(html).toContain("Event state");
    expect(html).toContain("Publish");
    expect(html).toContain("Delete draft");
    expect(html).toContain("event-form:Update event");
  });

  it("/organizer/events/[eventId]/registrations shows loading, error, empty, unavailable, and success states", () => {
    organizerRegistrationsState.isLoading = true;
    const loadingHtml = render(<OrganizerEventRegistrationsPage />);
    expect(loadingHtml).toContain("Loading event registrations...");

    organizerRegistrationsState.isLoading = false;
    organizerRegistrationsState.isError = true;
    organizerRegistrationsState.error = new Error("Registration view unavailable");
    const errorHtml = render(<OrganizerEventRegistrationsPage />);
    expect(errorHtml).toContain("Could not load event registrations");
    expect(errorHtml).toContain("Registration view unavailable");

    organizerRegistrationsState.isError = false;
    organizerRegistrationsState.data = {
      eventTitle: "Atlas Summit",
      registrations: []
    };
    const emptyHtml = render(<OrganizerEventRegistrationsPage />);
    expect(emptyHtml).toContain("No registrations yet");
    expect(emptyHtml).toContain("Atlas Summit");

    organizerRegistrationsState.data = undefined;
    const unavailableHtml = render(<OrganizerEventRegistrationsPage />);
    expect(unavailableHtml).toContain("Event registrations unavailable");

    organizerRegistrationsState.data = {
      eventTitle: "Atlas Summit",
      registrations: [
        {
          id: "reg-1",
          participantName: "Sara Bennani",
          status: "CONFIRMED",
          ticketRef: "TCK-001"
        }
      ]
    };
    const successHtml = render(<OrganizerEventRegistrationsPage />);
    expect(successHtml).toContain("Atlas Summit:Sara Bennani");
    expect(successHtml).toContain("Export CSV");
  });
});
