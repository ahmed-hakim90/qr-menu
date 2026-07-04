import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { FloorDesigner } from "@/components/floor/floor-designer";
import { listFloors } from "@/features/floor/services/floor-service";
import { getEffectiveLimits, getRestaurantSubscription } from "@/lib/plans";
import { PlanUpgradePrompt } from "@/components/dashboard/plan-upgrade-prompt";

export default async function FloorPage() {
  const session = await getSession();
  if (!session) return null;

  const subscription = await getRestaurantSubscription(session.restaurantId);
  const limits = getEffectiveLimits(subscription);

  if (!limits.hasTables) {
    return (
      <PlanUpgradePrompt
        title="Floor Designer"
        description="Your current plan is menu-only. Upgrade to enable table layouts and floor planning."
      />
    );
  }

  const [branches, tables, floors] = await Promise.all([
    db.branch.findMany({
      where: { restaurantId: session.restaurantId },
      select: { id: true, nameEn: true, nameAr: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.diningTable.findMany({
      where: { restaurantId: session.restaurantId, isActive: true },
      select: { id: true, name: true, number: true, seats: true, branchId: true },
      orderBy: { number: "asc" },
    }),
    listFloors(session.restaurantId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Floor Designer</h1>
        <p className="text-sm text-muted-foreground">Design branch floors, place tables, and save layouts.</p>
      </div>
      <FloorDesigner
        branches={branches}
        tables={tables}
        initialFloors={floors.map((floor) => ({
          ...floor,
          tables: floor.tables.map((entry) => ({
            ...entry,
            shape: entry.shape as "circle" | "rectangle" | "square",
            table: entry.table
              ? {
                  id: entry.table.id,
                  branchId: entry.table.branchId,
                  name: entry.table.name,
                  number: entry.table.number,
                  seats: entry.table.seats,
                }
              : undefined,
          })),
        }))}
      />
    </div>
  );
}
