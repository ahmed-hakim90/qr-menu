import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CategoriesManager } from "@/components/dashboard/categories-manager";

export default async function CategoriesPage() {
  const session = await getSession();
  if (!session) return null;

  const categories = await db.category.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return <CategoriesManager categories={categories} />;
}
