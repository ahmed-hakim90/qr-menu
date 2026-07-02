import { db } from "@/lib/db";
import { PlansManager } from "@/components/admin/plans-manager";

export default async function AdminPlansPage() {
  const plans = await db.plan.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { subscriptions: true } } },
  });

  return <PlansManager plans={plans} />;
}
