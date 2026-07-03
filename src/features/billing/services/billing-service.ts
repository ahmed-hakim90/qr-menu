import { db } from "@/lib/db";

export async function submitSubscriptionPaymentRequest(input: {
  restaurantId: string;
  planSlug: string;
  paymentReference?: string;
  paymentNotes?: string;
}) {
  const plan = await db.plan.findFirst({
    where: { slug: input.planSlug, isActive: true },
  });
  if (!plan) {
    throw new Error("Plan not found");
  }

  const paymentReference = input.paymentReference?.trim() || null;
  const paymentNotes = input.paymentNotes?.trim() || null;
  const isPaidPlan = plan.priceMonthly > 0;

  if (isPaidPlan && !paymentReference) {
    throw new Error("Payment reference is required for paid plans");
  }

  const status = isPaidPlan ? "PENDING" : "ACTIVE";

  return db.subscription.upsert({
    where: { restaurantId: input.restaurantId },
    create: {
      restaurantId: input.restaurantId,
      planId: plan.id,
      status,
      paymentReference,
      paymentNotes,
      currentPeriodStart: new Date(),
      currentPeriodEnd: isPaidPlan
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : null,
    },
    update: {
      planId: plan.id,
      status,
      paymentReference,
      paymentNotes,
      currentPeriodStart: new Date(),
      currentPeriodEnd: isPaidPlan
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : null,
    },
    include: {
      plan: true,
      restaurant: true,
    },
  });
}

export async function countPendingSubscriptionPayments() {
  return db.subscription.count({ where: { status: "PENDING" } });
}
