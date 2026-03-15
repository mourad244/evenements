import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { User } from "@/types/user.types";

import { getAccessToken, getStoredUser } from "../utils/auth-storage";

function normalizeUser(input: Record<string, unknown>): User {
  return {
    id: String(input.userId || input.id || ""),
    email: String(input.email || ""),
    fullName: String(input.displayName || input.fullName || "User"),
    role: String(input.role || "PARTICIPANT") as User["role"]
  };
}

export async function getMe(): Promise<User | null> {
  const token = getAccessToken();
  if (!token) {
    return getStoredUser();
  }

  try {
    const response = await apiClient.get(ENDPOINTS.auth.me);
    const payload = response.data?.data?.user || response.data?.data || response.data;
    return normalizeUser((payload || {}) as Record<string, unknown>);
  } catch (error) {
    const fallback = getStoredUser();
    if (fallback) return fallback;
    throw normalizeApiError(error);
  }
}
