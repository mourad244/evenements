import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { RegisterInput } from "../types/auth.types";

export async function register(payload: RegisterInput) {
  try {
    const response = await apiClient.post(ENDPOINTS.auth.register, {
      email: payload.email,
      password: payload.password,
      displayName: payload.fullName,
      role: payload.role
    });
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
