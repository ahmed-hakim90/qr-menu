import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { BranchesManager } from "@/components/dashboard/branches-manager";
import { getEffectiveLimits, getRestaurantSubscription } from "@/lib/plans";

export default async function BranchesPage() {
  const session = await getSession();
  if (!session) return null;

  const [branches, subscription] = await Promise.all([
    db.branch.findMany({
      where: { restaurantId: session.restaurantId },
      orderBy: { sortOrder: "asc" },
    }),
    getRestaurantSubscription(session.restaurantId),
  ]);

  const limits = getEffectiveLimits(subscription);

  return <BranchesManager branches={branches} branchLimit={limits.maxBranches} />;
}
