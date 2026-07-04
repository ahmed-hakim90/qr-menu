import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { TablesManager } from "@/components/dashboard/tables-manager";
import { getEffectiveLimits, getRestaurantSubscription } from "@/lib/plans";
import { PlanUpgradePrompt } from "@/components/dashboard/plan-upgrade-prompt";

export default async function TablesPage() {
  const session = await getSession();
  if (!session) return null;

  const subscription = await getRestaurantSubscription(session.restaurantId);
  const limits = getEffectiveLimits(subscription);

  if (!limits.hasTables) {
    return (
      <PlanUpgradePrompt
        title="Tables"
        description="Your current plan is menu-only. Upgrade to enable table QR codes and reservations."
      />
    );
  }

  const [tables, branches] = await Promise.all([
    db.diningTable.findMany({
      where: { restaurantId: session.restaurantId },
      include: {
        branch: { select: { id: true, nameAr: true, nameEn: true, slug: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { number: "asc" }],
    }),
    db.branch.findMany({
      where: { restaurantId: session.restaurantId },
      select: { id: true, nameAr: true, nameEn: true, slug: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return <TablesManager tables={tables} branches={branches} />;
}
