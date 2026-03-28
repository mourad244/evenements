import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { AdminUser } from "../types/admin.types";

function mapAdminUser(input: Record<string, unknown>): AdminUser {
  return {
    id: String(input.userId || input.id || ""),
    email: String(input.email || ""),
    fullName: String(input.displayName || input.fullName || "User"),
    role: String(input.role || "PARTICIPANT") as AdminUser["role"],
    createdAt: String(input.createdAt || new Date().toISOString())
  };
}

export async function getUsers(): Promise<AdminUser[]> {
  try {
    const response = await apiClient.get(ENDPOINTS.admin.users);
    const items = response.data?.data?.items || response.data?.data || response.data || [];
    return items.map((item: Record<string, unknown>) => mapAdminUser(item));
  } catch (error) {
    throw normalizeApiError(error);
  }
}
