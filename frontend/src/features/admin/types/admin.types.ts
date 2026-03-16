import type { EventItem } from "@/features/events/types/event.types";
import type { User } from "@/types/user.types";

export type AdminUser = User & {
  createdAt: string;
};

export type AdminEvent = EventItem;
