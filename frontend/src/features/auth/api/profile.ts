import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { UpdateProfileInput, UserProfile } from "../types/auth.types";

function normalizeProfile(input: Record<string, unknown>): UserProfile {
  const userId = String(input.userId || input.id || "");
  const displayName = String(input.displayName || input.fullName || input.name || "");
  const fullName = String(input.fullName || input.displayName || input.name || "");
  const name = String(input.name || displayName || fullName || "User");

  return {
    id: String(input.id || userId || ""),
    userId,
    fullName: fullName || "User",
    displayName: displayName || fullName || "User",
    name,
    email: String(input.email || ""),
    role: String(input.role || "PARTICIPANT") as UserProfile["role"],
    phone: input.phone ? String(input.phone) : null,
    city: input.city ? String(input.city) : null,
    bio: input.bio ? String(input.bio) : null
  };
}

export async function getProfile(): Promise<UserProfile> {
  try {
    const response = await apiClient.get(ENDPOINTS.auth.profile);
    const payload = response.data?.data?.user || response.data?.data || response.data || {};
    return normalizeProfile(payload as Record<string, unknown>);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateProfile(payload: UpdateProfileInput): Promise<UserProfile> {
  try {
    const response = await apiClient.patch(ENDPOINTS.auth.profile, payload);
    const data = response.data?.data?.user || response.data?.data || response.data || {};
    return normalizeProfile(data as Record<string, unknown>);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
