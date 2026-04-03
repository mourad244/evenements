import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

export type UpdateProfilePayload = {
  fullName?: string;
  phone?: string | null;
  city?: string | null;
  bio?: string | null;
};

export type ProfileData = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  city: string | null;
  bio: string | null;
  role: string;
  createdAt: string | null;
  updatedAt: string | null;
};

function normalizeProfile(input: Record<string, unknown>): ProfileData {
  return {
    id: String(input.userId || input.id || ""),
    email: String(input.email || ""),
    fullName: String(input.fullName || input.displayName || ""),
    phone: input.phone ? String(input.phone) : null,
    city: input.city ? String(input.city) : null,
    bio: input.bio ? String(input.bio) : null,
    role: String(input.role || "PARTICIPANT"),
    createdAt: input.createdAt ? String(input.createdAt) : null,
    updatedAt: input.updatedAt ? String(input.updatedAt) : null
  };
}

export async function getProfile(): Promise<ProfileData> {
  try {
    const response = await apiClient.get(ENDPOINTS.profile.get);
    const data = response.data?.data || response.data;
    return normalizeProfile((data || {}) as Record<string, unknown>);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<ProfileData> {
  try {
    const response = await apiClient.patch(ENDPOINTS.profile.update, payload);
    const data = response.data?.data || response.data;
    return normalizeProfile((data || {}) as Record<string, unknown>);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
