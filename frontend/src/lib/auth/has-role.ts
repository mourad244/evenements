import type { Role } from "@/types/common.types";

export function hasRole(currentRole: Role | undefined, allowedRoles: Role[]) {
  if (!currentRole) return false;
  return allowedRoles.includes(currentRole);
}
