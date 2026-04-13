import type { PaymentSession } from "../types/payment.types";

export async function createPaymentSession(): Promise<PaymentSession> {
  return {
    checkoutUrl: "/payments/todo",
    sessionId: "payment-session-placeholder"
  };
}
