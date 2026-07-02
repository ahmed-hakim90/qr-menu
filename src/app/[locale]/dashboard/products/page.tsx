import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProductsManager } from "@/components/dashboard/products-manager";
import { getEffectiveLimits, getRestaurantSubscription } from "@/lib/plans";

export default async function ProductsPage() {
  const session = await getSession();
  if (!session) return null;

  const [products, categories, branches, settings, subscription] = await Promise.all([
    db.product.findMany({
      where: { restaurantId: session.restaurantId },
      orderBy: { sortOrder: "asc" },
      include: {
        category: true,
        productBranches: { include: { branch: true } },
      },
    }),
    db.category.findMany({
      where: { restaurantId: session.restaurantId },
      orderBy: { sortOrder: "asc" },
    }),
    db.branch.findMany({
      where: { restaurantId: session.restaurantId },
      orderBy: { sortOrder: "asc" },
    }),
    db.settings.findUnique({
      where: { restaurantId: session.restaurantId },
    }),
    getRestaurantSubscription(session.restaurantId),
  ]);

  const limits = getEffectiveLimits(subscription);

  return (
    <ProductsManager
      products={products}
      categories={categories}
      branches={branches}
      currencySymbol={settings?.currencySymbol}
      productLimit={limits.maxProducts}
    />
  );
}
