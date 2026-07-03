import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { billingSubscribeSchema } from "@/lib/validators";
import { submitSubscriptionPaymentRequest } from "@/features/billing/services/billing-service";
import { getRestaurantSubscription, getRestaurantUsage } from "@/lib/plans";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const [subscription, usage, plans] = await Promise.all([
    getRestaurantSubscription(session!.restaurantId),
    getRestaurantUsage(session!.restaurantId),
    db.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return NextResponse.json({ subscription, usage, plans });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const body = await request.json();
  const parsed = billingSubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const subscription = await submitSubscriptionPaymentRequest({
      restaurantId: session!.restaurantId,
      planSlug: parsed.data.planSlug,
      paymentReference: parsed.data.paymentReference,
      paymentNotes: parsed.data.paymentNotes,
    });
    return NextResponse.json(subscription, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit payment";
    const status = message === "Plan not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
