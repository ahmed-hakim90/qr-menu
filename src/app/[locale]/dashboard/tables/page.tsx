import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { TablesManager } from "@/components/dashboard/tables-manager";
import { getEffectiveLimits, getRestaurantSubscription } from "@/lib/plans";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function TablesPage() {
  const session = await getSession();
  if (!session) return null;

  const subscription = await getRestaurantSubscription(session.restaurantId);
  const limits = getEffectiveLimits(subscription);

  if (!limits.hasTables) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold">Tables</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your current plan is menu-only. Upgrade to enable table QR codes and table ordering.
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/billing">View Plans</Link>
          </Button>
        </CardContent>
      </Card>
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
