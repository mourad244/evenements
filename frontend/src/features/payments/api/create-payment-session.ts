import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { PaymentSession, PaymentSessionPayload } from "../types/payment.types";

/**
 * Creates a payment session then immediately simulates webhook confirmation.
 * In production this would instead redirect to a payment provider (e.g. Stripe).
 */
export async function createPaymentSession(
  payload: PaymentSessionPayload
): Promise<PaymentSession> {
  try {
    // Step 1: create the session
    const response = await apiClient.post(ENDPOINTS.payments.session, payload);
    const session: PaymentSession = response.data?.data ?? response.data;

    // Step 2: simulate payment completion via webhook (demo only — no real provider)
    await apiClient.post(ENDPOINTS.payments.webhook, {
      paymentId: session.paymentId,
      providerSessionId: session.providerSessionId,
      providerPaymentId: session.providerSessionId,
      status: "SUCCEEDED",
      webhookId: crypto.randomUUID()
    });

    return session;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
