import { createHmac, timingSafeEqual } from "crypto";

type PaymobTransaction = {
  amount_cents: number | string;
  created_at: string | number;
  currency: string;
  error_occured: boolean | string;
  has_parent_transaction: boolean | string;
  id: number | string;
  integration_id: number | string;
  is_3d_secure: boolean | string;
  is_auth: boolean | string;
  is_capture: boolean | string;
  is_refunded: boolean | string;
  is_standalone_payment: boolean | string;
  is_voided: boolean | string;
  order: { id: number | string };
  owner: number | string;
  pending: boolean | string;
  source_data: {
    pan: string;
    sub_type: string;
    type: string;
  };
  success: boolean | string;
};

function transactionFields(obj: PaymobTransaction) {
  return [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    obj.order.id,
    obj.owner,
    obj.pending,
    obj.source_data.pan,
    obj.source_data.sub_type,
    obj.source_data.type,
    obj.success,
  ].map(String);
}

export function validatePaymobTransactionHmac(
  obj: PaymobTransaction,
  receivedHmac: string | null | undefined
) {
  const secret = process.env.PAYMOB_HMAC_SECRET;
  if (!secret || !receivedHmac) {
    return false;
  }

  const computed = createHmac("sha512", secret)
    .update(transactionFields(obj).join(""))
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(computed), Buffer.from(receivedHmac));
  } catch {
    return false;
  }
}
