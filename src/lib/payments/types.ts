export type PaymentIntentInput = {
  restaurantId: string;
  branchId: string;
  sessionId: string;
  orderId?: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
};

export type PaymentIntentResult = {
  providerReference?: string;
  checkoutUrl?: string;
  rawResponse?: Record<string, unknown>;
};

export interface PaymentProvider {
  readonly name: "CASH" | "PAYMOB";
  createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  verifyWebhook(
    payload: unknown,
    hmac?: string | null
  ): Promise<{
    providerReference: string;
    status: "PAID" | "FAILED";
    rawResponse?: Record<string, unknown>;
  } | null>;
}
