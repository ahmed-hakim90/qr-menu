import { db } from "@/lib/db";
import { RestaurantsManager } from "@/components/admin/restaurants-manager";
import { getAppDomain } from "@/lib/tenant-host";

export default async function AdminRestaurantsPage() {
  const restaurants = await db.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: { include: { plan: true } },
      users: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
      branches: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { slug: true },
      },
      _count: {
        select: {
          branches: true,
          products: true,
          users: true,
        },
      },
    },
  });

  return <RestaurantsManager restaurants={restaurants} appDomain={getAppDomain()} />;
}
