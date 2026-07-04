import { redirect } from "next/navigation";
import { getSession, hasPermission } from "@/lib/auth";
import { getEffectiveLimits, getRestaurantSubscription } from "@/lib/plans";
import { CaptainDashboard } from "@/components/captain/captain-dashboard";
import { PlanUpgradePrompt } from "@/components/dashboard/plan-upgrade-prompt";

export default async function CaptainPage() {
  const session = await getSession();
  if (!session || !hasPermission(session.role, ["CAPTAIN"])) redirect("/dashboard");

  const subscription = await getRestaurantSubscription(session.restaurantId);
  const limits = getEffectiveLimits(subscription);

  if (!limits.hasOrdering) {
    return (
      <PlanUpgradePrompt
        title="Captain Dashboard"
        description="Your current plan is menu-only. Upgrade to enable table ordering and captain workflows."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Captain Dashboard</h1>
        <p className="text-sm text-muted-foreground">Serve active tables and advance order statuses.</p>
      </div>
      <CaptainDashboard />
    </div>
  );
}
