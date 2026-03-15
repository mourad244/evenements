import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { ResetPasswordInput } from "../types/auth.types";

export async function resetPassword(payload: ResetPasswordInput) {
  try {
    const response = await apiClient.post(ENDPOINTS.auth.resetPassword, {
      token: payload.token,
      newPassword: payload.password
    });
    return response.data?.data || response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
