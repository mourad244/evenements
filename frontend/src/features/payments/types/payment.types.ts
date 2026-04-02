export type PaymentSessionPayload = {
  amount: number;
  currency: string;
  registrationId?: string | null;
  eventId?: string | null;
  provider?: string;
  metadata?: Record<string, unknown>;
};

export type PaymentSession = {
  paymentId: string;
  registrationId: string | null;
  eventId: string | null;
  participantId: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  providerSessionId: string;
  providerPaymentId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};
