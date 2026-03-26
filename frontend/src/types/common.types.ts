export type Nullable<T> = T | null;

export type Role = "GUEST" | "PARTICIPANT" | "ORGANIZER" | "ADMIN";

export type PageMeta = {
  title: string;
  description?: string;
};
