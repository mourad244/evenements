import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { ForgotPasswordInput } from "../types/auth.types";

export async function forgotPassword(payload: ForgotPasswordInput) {
  try {
    const response = await apiClient.post(ENDPOINTS.auth.forgotPassword, payload);
    return response.data?.data || response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
