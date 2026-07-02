import type { PaymentIntentInput, PaymentIntentResult, PaymentProvider } from "./types";

export class CashPaymentProvider implements PaymentProvider {
  readonly name = "CASH" as const;

  async createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    return {
      providerReference: `cash-${input.sessionId}-${Date.now()}`,
    };
  }

  async verifyWebhook(): Promise<null> {
    return null;
  }
}
