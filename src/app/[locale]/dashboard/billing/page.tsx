import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { BillingManager } from "@/components/dashboard/billing-manager";
import { getRestaurantUsage } from "@/lib/plans";

export default async function BillingPage() {
  const session = await getSession();
  if (!session) return null;

  const [subscription, plans, usage] = await Promise.all([
    db.subscription.findUnique({
      where: { restaurantId: session.restaurantId },
      include: { plan: true },
    }),
    db.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    getRestaurantUsage(session.restaurantId),
  ]);

  return <BillingManager subscription={subscription} plans={plans} usage={usage} />;
}
