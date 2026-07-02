import { db } from "@/lib/db";
import { SubscriptionsManager } from "@/components/admin/subscriptions-manager";

export default async function AdminSubscriptionsPage() {
  const [subscriptions, plans] = await Promise.all([
    db.subscription.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        plan: true,
        restaurant: {
          include: {
            _count: { select: { branches: true, products: true, users: true } },
          },
        },
      },
    }),
    db.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return <SubscriptionsManager subscriptions={subscriptions} plans={plans} />;
}
