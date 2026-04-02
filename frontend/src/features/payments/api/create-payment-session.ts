import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { PaymentSession, PaymentSessionPayload } from "../types/payment.types";

export async function createPaymentSession(
  payload: PaymentSessionPayload
): Promise<PaymentSession> {
  try {
    const response = await apiClient.post(ENDPOINTS.payments.session, payload);
    return response.data?.data ?? response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
