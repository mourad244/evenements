import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { AuthSession, LoginInput } from "../types/auth.types";
import type { User } from "@/types/user.types";

function normalizeUser(input: Record<string, unknown>, fallbackEmail: string): User {
  return {
    id: String(input.userId || input.id || ""),
    email: String(input.email || fallbackEmail),
    fullName: String(input.displayName || input.fullName || "User"),
    role: String(input.role || "PARTICIPANT") as User["role"]
  };
}

export async function login(payload: LoginInput): Promise<AuthSession> {
  try {
    const response = await apiClient.post(ENDPOINTS.auth.login, payload);
    const data = response.data?.data || response.data;
    return {
      accessToken: String(data.accessToken || ""),
      refreshToken: data.refreshToken ? String(data.refreshToken) : undefined,
      expiresIn: data.expiresIn ? Number(data.expiresIn) : undefined,
      user: normalizeUser((data.user || {}) as Record<string, unknown>, payload.email)
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}
