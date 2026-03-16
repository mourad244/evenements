export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED";

export type EventModel = {
  id: string;
  title: string;
  description: string;
  city: string;
  venue: string;
  startAt: string;
  endAt?: string;
  price: number;
  currency: string;
  capacity: number;
  theme: string;
  status: EventStatus;
  imageUrl?: string;
};

export type EventItem = EventModel;

export type EventCardModel = Pick<
  EventModel,
  | "id"
  | "title"
  | "description"
  | "city"
  | "venue"
  | "startAt"
  | "price"
  | "currency"
  | "theme"
  | "imageUrl"
>;

export type EventFilters = {
  query?: string;
  city?: string;
  theme?: string;
};

export type UpsertEventInput = {
  title: string;
  description: string;
  city: string;
  venue: string;
  startAt: string;
  endAt?: string;
  price: number;
  currency: string;
  capacity: number;
  theme: string;
};
