import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DomainManager } from "@/components/dashboard/domain-manager";
import { getEffectiveLimits, getRestaurantSubscription } from "@/lib/plans";
import { getAppDomain } from "@/lib/tenant-host";

export default async function DomainPage() {
  const session = await getSession();
  if (!session) return null;

  const [restaurant, subscription] = await Promise.all([
    db.restaurant.findUnique({
      where: { id: session.restaurantId },
      select: { subdomain: true, customDomain: true, slug: true },
    }),
    getRestaurantSubscription(session.restaurantId),
  ]);

  if (!restaurant) return null;

  const limits = getEffectiveLimits(subscription);

  return (
    <DomainManager
      subdomain={restaurant.subdomain || restaurant.slug}
      customDomain={restaurant.customDomain || ""}
      appDomain={getAppDomain()}
      customDomainAllowed={limits.customDomain}
    />
  );
}
