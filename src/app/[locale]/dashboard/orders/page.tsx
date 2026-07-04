import { getSession } from "@/lib/auth";
import { getEffectiveLimits, getRestaurantSubscription } from "@/lib/plans";
import { OrderBoard } from "@/components/orders/order-board";
import { PlanUpgradePrompt } from "@/components/dashboard/plan-upgrade-prompt";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) return null;

  const subscription = await getRestaurantSubscription(session.restaurantId);
  const limits = getEffectiveLimits(subscription);

  if (!limits.hasOrdering) {
    return (
      <PlanUpgradePrompt
        title="Order Board"
        description="Your current plan is menu-only. Upgrade to enable table ordering, captain, and cashier workflows."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Order Board</h1>
        <p className="text-sm text-muted-foreground">Track live orders across the service flow.</p>
      </div>
      <OrderBoard />
    </div>
  );
}
