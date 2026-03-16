/** @vitest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

const eventsQueryState: EventsQueryState = {
  data: [],
  isLoading: false,
  isError: false
};

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) =>
    React.createElement("a", { href: String(href), ...props }, children)
}));

vi.mock("next/image", () => ({
  default: ({ fill: _fill, ...props }: Record<string, unknown>) =>
    React.createElement("img", props)
}));

vi.mock("@/features/events/hooks/use-events-query", () => ({
  useEventsQuery: () => eventsQueryState
}));

import EventsPage from "../page";

describe("events discovery refinements", () => {
  beforeEach(() => {
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
      },
      {
        id: "evt-2",
        title: "Design Circle",
        description: "Community meetup",
        city: "Rabat",
        venue: "Studio One",
        theme: "Design",
        price: 200,
        currency: "MAD",
        startAt: "2026-05-10T09:00:00.000Z"
      }
    ];
    eventsQueryState.isLoading = false;
    eventsQueryState.isError = false;
    eventsQueryState.error = undefined;
  });

  it("shows active discovery state and resets local search and sort", async () => {
    const user = userEvent.setup();

    render(<EventsPage />);

    const searchInput = screen.getByLabelText("Search visible events");
    const sortSelect = screen.getByLabelText("Sort visible results");

    expect(screen.queryByRole("button", { name: "Reset filters" })).toBeNull();

    await user.type(searchInput, "Atlas");
    await user.selectOptions(sortSelect, "price-high");

    expect(screen.getByRole("button", { name: "Reset filters" })).toBeTruthy();
    expect(screen.getByText('Search: "Atlas"')).toBeTruthy();
    expect(screen.getByText("Sort: Highest price")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Reset filters" }));

    expect((searchInput as HTMLInputElement).value).toBe("");
    expect((sortSelect as HTMLSelectElement).value).toBe("soonest");
    expect(screen.queryByText('Search: "Atlas"')).toBeNull();
    expect(screen.queryByRole("button", { name: "Reset filters" })).toBeNull();
  });

  it("shows result summaries and clearer empty-search feedback", async () => {
    const user = userEvent.setup();

    render(<EventsPage />);

    expect(screen.getByText("Showing 2 of 2 visible catalog events.")).toBeTruthy();

    await user.type(screen.getByLabelText("Search visible events"), "zz-topia");

    expect(screen.getByText("0 of 2 visible events")).toBeTruthy();
    expect(screen.getByText("No events found")).toBeTruthy();
    expect(screen.getByText('No visible events match "zz-topia". Try a broader search or reset the sort order.')).toBeTruthy();
  });
});
