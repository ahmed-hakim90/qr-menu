import { NextRequest, NextResponse } from "next/server";
import { handlePaymobWebhook } from "@/features/payments/services/payment-service";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const hmac = request.nextUrl.searchParams.get("hmac");
  const payment = await handlePaymobWebhook(payload, hmac);

  if (!payment) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 401 });
  }

  return NextResponse.json({ received: true, paymentId: payment.id });
}
