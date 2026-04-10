export type EventStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "FULL"
  | "CLOSED"
  | "ARCHIVED"
  | "CANCELLED";

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

export type OrganizerEventsQueryFilters = {
  status?: EventStatus | "";
  theme?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
};

export type OrganizerEventCounts = {
  total: number;
  draft: number;
  published: number;
  full: number;
  closed: number;
  archived: number;
  cancelled: number;
};

export type OrganizerEventsResult = {
  items: EventItem[];
  page: number;
  pageSize: number;
  total: number;
  counts: OrganizerEventCounts;
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
  imageUrl?: string;
};
