import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import {
  createSessionPayment,
  listWaitingBillSessions,
} from "@/features/payments/services/payment-service";
import { createPaymentSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { session, error } = await requireSession("CASHIER");
  if (error) return error;

  const branchId = request.nextUrl.searchParams.get("branchId") || undefined;
  const sessions = await listWaitingBillSessions(session!.restaurantId, branchId);
  return NextResponse.json(sessions);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession("CASHIER");
  if (error) return error;

  const body = await request.json();
  const parsed = createPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const payment = await createSessionPayment(parsed.data);
    if (payment.restaurantId !== session!.restaurantId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(payment, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment failed" },
      { status: 400 }
    );
  }
}
