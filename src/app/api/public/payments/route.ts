import { NextRequest, NextResponse } from "next/server";
import { createSessionPayment } from "@/features/payments/services/payment-service";
import { createPaymentSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = createPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.provider === "CASH") {
    return NextResponse.json({ error: "Cash payments must be handled by staff" }, { status: 403 });
  }

  try {
    const payment = await createSessionPayment(parsed.data);
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment failed" },
      { status: 400 }
    );
  }
}
