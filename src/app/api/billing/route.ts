import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { billingSubscribeSchema } from "@/lib/validators";
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
  const { session, error } = await requireSession("OWNER");
  if (error) return error;

  const body = await request.json();
  const parsed = billingSubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const plan = await db.plan.findFirst({
    where: { slug: parsed.data.planSlug, isActive: true },
  });
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const subscription = await db.subscription.upsert({
    where: { restaurantId: session!.restaurantId },
    create: {
      restaurantId: session!.restaurantId,
      planId: plan.id,
      status: plan.priceMonthly === 0 ? "ACTIVE" : "PENDING",
      paymentReference: parsed.data.paymentReference || null,
      paymentNotes: parsed.data.paymentNotes || null,
      currentPeriodStart: new Date(),
      currentPeriodEnd:
        plan.priceMonthly === 0
          ? null
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    update: {
      planId: plan.id,
      status: plan.priceMonthly === 0 ? "ACTIVE" : "PENDING",
      paymentReference: parsed.data.paymentReference || null,
      paymentNotes: parsed.data.paymentNotes || null,
      currentPeriodStart: new Date(),
      currentPeriodEnd:
        plan.priceMonthly === 0
          ? null
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    include: { plan: true },
  });

  return NextResponse.json(subscription);
}
