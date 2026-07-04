import { redirect } from "next/navigation";
import { getSession, hasPermission } from "@/lib/auth";
import { getEffectiveLimits, getRestaurantSubscription } from "@/lib/plans";
import { CashierDashboard } from "@/components/cashier/cashier-dashboard";
import { PlanUpgradePrompt } from "@/components/dashboard/plan-upgrade-prompt";

export default async function CashierPage() {
  const session = await getSession();
  if (!session || !hasPermission(session.role, ["CASHIER"])) redirect("/dashboard");

  const subscription = await getRestaurantSubscription(session.restaurantId);
  const limits = getEffectiveLimits(subscription);

  if (!limits.hasOrdering) {
    return (
      <PlanUpgradePrompt
        title="Cashier Dashboard"
        description="Your current plan is menu-only. Upgrade to enable payments and cashier workflows."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cashier Dashboard</h1>
        <p className="text-sm text-muted-foreground">Collect cash or launch Paymob checkout for waiting bills.</p>
      </div>
      <CashierDashboard />
    </div>
  );
}
