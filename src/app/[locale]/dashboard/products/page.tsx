import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProductsManager } from "@/components/dashboard/products-manager";

export default async function ProductsPage() {
  const session = await getSession();
  if (!session) return null;

  const [products, categories, settings] = await Promise.all([
    db.product.findMany({
      where: { restaurantId: session.restaurantId },
      orderBy: { sortOrder: "asc" },
      include: { category: true },
    }),
    db.category.findMany({
      where: { restaurantId: session.restaurantId },
      orderBy: { sortOrder: "asc" },
    }),
    db.settings.findUnique({
      where: { restaurantId: session.restaurantId },
    }),
  ]);

  return (
    <ProductsManager
      products={products}
      categories={categories}
      currencySymbol={settings?.currencySymbol}
    />
  );
}
