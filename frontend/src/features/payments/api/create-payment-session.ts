import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error-handler";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { CreatePaymentSessionInput, PaymentSession } from "../types/payment.types";

function normalizePaymentSession(input: Record<string, unknown>): PaymentSession {
  return {
    paymentId: String(input.paymentId || ""),
    registrationId: input.registrationId ? String(input.registrationId) : null,
    eventId: input.eventId ? String(input.eventId) : null,
    participantId: input.participantId ? String(input.participantId) : null,
    amount: Number(input.amount || 0),
    currency: String(input.currency || "MAD"),
    status: String(input.status || "PENDING"),
    provider: input.provider ? String(input.provider) : null,
    providerSessionId: input.providerSessionId ? String(input.providerSessionId) : null,
    providerPaymentId: input.providerPaymentId ? String(input.providerPaymentId) : null,
    createdAt: input.createdAt ? String(input.createdAt) : null,
    updatedAt: input.updatedAt ? String(input.updatedAt) : null,
    metadata: (input.metadata as Record<string, unknown>) || null
  };
}

export async function createPaymentSession(
  payload: CreatePaymentSessionInput
): Promise<PaymentSession> {
  try {
    const response = await apiClient.post(ENDPOINTS.payments.session, payload);
    const data = response.data?.data || response.data || {};
    return normalizePaymentSession(data as Record<string, unknown>);
  } catch (error) {
    throw normalizeApiError(error);
  }
}
