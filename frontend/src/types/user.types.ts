import type { Role } from "./common.types";

export type User = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
};
