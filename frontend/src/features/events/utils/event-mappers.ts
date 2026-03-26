import type { EventFilters, EventItem, UpsertEventInput } from "../types/event.types";

type EventApiShape = Partial<EventItem> & {
  eventId?: string;
  venueName?: string;
  coverImageRef?: string;
  pricingType?: "FREE" | "PAID";
};

export function mapEventResponse(input: EventApiShape): EventItem {
  return {
    id: input.id || input.eventId || "event-placeholder",
    title: input.title || "Untitled event",
    description: input.description || "Description coming soon.",
    city: input.city || "Casablanca",
    venue: input.venue || input.venueName || "Main venue",
    startAt: input.startAt || new Date().toISOString(),
    endAt: input.endAt,
    price: input.price ?? (input.pricingType === "PAID" ? 99 : 0),
    currency: input.currency || "MAD",
    capacity: input.capacity ?? 0,
    theme: input.theme || "General",
    status: input.status || "PUBLISHED",
    imageUrl: input.imageUrl || input.coverImageRef || "/images/placeholder-event.jpg"
  };
}

export function mapEventFiltersToCatalogParams(filters?: EventFilters) {
  if (!filters) return undefined;

  return {
    q: filters.query,
    city: filters.city,
    theme: filters.theme
  };
}

export function mapUpsertEventToDraftPayload(payload: UpsertEventInput) {
  return {
    title: payload.title,
    description: payload.description,
    theme: payload.theme,
    venueName: payload.venue,
    city: payload.city,
    startAt: payload.startAt,
    endAt: payload.endAt || null,
    timezone: "Africa/Casablanca",
    capacity: payload.capacity,
    visibility: "PUBLIC",
    pricingType: payload.price > 0 ? "PAID" : "FREE",
    coverImageRef: null
  };
}
