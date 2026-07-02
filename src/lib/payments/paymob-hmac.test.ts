import { createHmac } from "crypto";
import { afterEach, describe, expect, it } from "vitest";
import { validatePaymobTransactionHmac } from "./paymob-hmac";

const sampleTransaction = {
  amount_cents: 10000,
  created_at: "2026-07-03T00:00:00",
  currency: "EGP",
  error_occured: false,
  has_parent_transaction: false,
  id: 12345,
  integration_id: 67890,
  is_3d_secure: false,
  is_auth: false,
  is_capture: false,
  is_refunded: false,
  is_standalone_payment: true,
  is_voided: false,
  order: { id: 999 },
  owner: 1,
  pending: false,
  source_data: {
    pan: "1234",
    sub_type: "MasterCard",
    type: "card",
  },
  success: true,
};

function signTransaction(secret: string) {
  const fields = [
    sampleTransaction.amount_cents,
    sampleTransaction.created_at,
    sampleTransaction.currency,
    sampleTransaction.error_occured,
    sampleTransaction.has_parent_transaction,
    sampleTransaction.id,
    sampleTransaction.integration_id,
    sampleTransaction.is_3d_secure,
    sampleTransaction.is_auth,
    sampleTransaction.is_capture,
    sampleTransaction.is_refunded,
    sampleTransaction.is_standalone_payment,
    sampleTransaction.is_voided,
    sampleTransaction.order.id,
    sampleTransaction.owner,
    sampleTransaction.pending,
    sampleTransaction.source_data.pan,
    sampleTransaction.source_data.sub_type,
    sampleTransaction.source_data.type,
    sampleTransaction.success,
  ].map(String);

  return createHmac("sha512", secret).update(fields.join("")).digest("hex");
}

describe("validatePaymobTransactionHmac", () => {
  afterEach(() => {
    delete process.env.PAYMOB_HMAC_SECRET;
  });

  it("accepts a valid HMAC signature", () => {
    process.env.PAYMOB_HMAC_SECRET = "test-secret";
    const hmac = signTransaction("test-secret");

    expect(validatePaymobTransactionHmac(sampleTransaction, hmac)).toBe(true);
  });

  it("rejects an invalid HMAC signature", () => {
    process.env.PAYMOB_HMAC_SECRET = "test-secret";

    expect(validatePaymobTransactionHmac(sampleTransaction, "invalid")).toBe(false);
  });

  it("rejects when secret or hmac is missing", () => {
    expect(validatePaymobTransactionHmac(sampleTransaction, null)).toBe(false);
  });
});
