import type { PaymentIntentInput, PaymentIntentResult, PaymentProvider } from "./types";
import { validatePaymobTransactionHmac } from "./paymob-hmac";

const PAYMOB_API = "https://accept.paymob.com/api";

async function paymobRequest<T>(path: string, body: Record<string, unknown>) {
  const response = await fetch(`${PAYMOB_API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Paymob request failed: ${text}`);
  }

  return response.json() as Promise<T>;
}

export class PaymobPaymentProvider implements PaymentProvider {
  readonly name = "PAYMOB" as const;

  async createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    const apiKey = process.env.PAYMOB_API_KEY;
    const integrationId = process.env.PAYMOB_INTEGRATION_ID;
    const iframeId = process.env.PAYMOB_IFRAME_ID;

    if (!apiKey || !integrationId || !iframeId) {
      throw new Error("Paymob is not configured");
    }

    const auth = await paymobRequest<{ token: string }>("/auth/tokens", {
      api_key: apiKey,
    });

    const amountCents = Math.round(input.amount * 100);
    const order = await paymobRequest<{ id: number }>("/ecommerce/orders", {
      auth_token: auth.token,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: input.currency,
      items: [],
    });

    const billingData = {
      apartment: "NA",
      email: input.customerEmail || "guest@restaurantos.local",
      floor: "NA",
      first_name: input.customerName || "Guest",
      street: "NA",
      building: "NA",
      phone_number: input.customerPhone || "+201000000000",
      shipping_method: "NA",
      postal_code: "NA",
      city: "Cairo",
      country: "EG",
      last_name: "Customer",
      state: "Cairo",
    };

    const paymentKey = await paymobRequest<{ token: string }>("/acceptance/payment_keys", {
      auth_token: auth.token,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: order.id,
      billing_data: billingData,
      currency: input.currency,
      integration_id: Number(integrationId),
    });

    return {
      providerReference: String(order.id),
      checkoutUrl: `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey.token}`,
      rawResponse: {
        orderId: order.id,
        paymentToken: paymentKey.token,
      },
    };
  }

  async verifyWebhook(payload: unknown, hmac?: string | null) {
    const body = payload as {
      obj?: {
        order?: { id?: number };
        success?: boolean;
        id?: number;
        amount_cents?: number | string;
        created_at?: string | number;
        currency?: string;
        error_occured?: boolean | string;
        has_parent_transaction?: boolean | string;
        integration_id?: number | string;
        is_3d_secure?: boolean | string;
        is_auth?: boolean | string;
        is_capture?: boolean | string;
        is_refunded?: boolean | string;
        is_standalone_payment?: boolean | string;
        is_voided?: boolean | string;
        owner?: number | string;
        pending?: boolean | string;
        source_data?: {
          pan?: string;
          sub_type?: string;
          type?: string;
        };
      };
    };

    const obj = body.obj;
    if (!obj?.order?.id || !obj.source_data) return null;

    if (
      !validatePaymobTransactionHmac(
        {
          amount_cents: obj.amount_cents ?? "",
          created_at: obj.created_at ?? "",
          currency: obj.currency ?? "",
          error_occured: obj.error_occured ?? false,
          has_parent_transaction: obj.has_parent_transaction ?? false,
          id: obj.id ?? "",
          integration_id: obj.integration_id ?? "",
          is_3d_secure: obj.is_3d_secure ?? false,
          is_auth: obj.is_auth ?? false,
          is_capture: obj.is_capture ?? false,
          is_refunded: obj.is_refunded ?? false,
          is_standalone_payment: obj.is_standalone_payment ?? false,
          is_voided: obj.is_voided ?? false,
          order: { id: obj.order.id },
          owner: obj.owner ?? "",
          pending: obj.pending ?? false,
          source_data: {
            pan: obj.source_data.pan ?? "",
            sub_type: obj.source_data.sub_type ?? "",
            type: obj.source_data.type ?? "",
          },
          success: obj.success ?? false,
        },
        hmac
      )
    ) {
      return null;
    }

    const orderId = obj.order.id;

    return {
      providerReference: String(orderId),
      status: obj.success ? ("PAID" as const) : ("FAILED" as const),
      rawResponse: body as Record<string, unknown>,
    };
  }
}
