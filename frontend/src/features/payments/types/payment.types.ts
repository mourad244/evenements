export type PaymentSession = {
  paymentId: string;
  registrationId: string | null;
  eventId: string | null;
  participantId: string | null;
  amount: number;
  currency: string;
  status: string;
  provider: string | null;
  providerSessionId: string | null;
  providerPaymentId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  metadata?: Record<string, unknown> | null;
};

export type CreatePaymentSessionInput = {
  registrationId?: string | null;
  eventId?: string | null;
  amount: number;
  currency: string;
  metadata?: Record<string, unknown>;
};
