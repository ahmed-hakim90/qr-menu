import { db } from "@/lib/db";
import { isMenuThemeSlug, type MenuThemeSlug } from "@/lib/menu-themes";

export async function getMenuPreviewData(restaurantId: string) {
  const branch = await db.branch.findFirst({
    where: { restaurantId, isActive: true },
    include: { restaurant: true },
    orderBy: { sortOrder: "asc" },
  });

  if (!branch) return null;

  const [categories, allProducts, settings] = await Promise.all([
    db.category.findMany({
      where: {
        restaurantId,
        isVisible: true,
        products: {
          some: {
            isAvailable: true,
            productBranches: { some: { branchId: branch.id, isAvailable: true } },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          where: {
            isAvailable: true,
            productBranches: { some: { branchId: branch.id, isAvailable: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    db.product.findMany({
      where: {
        restaurantId,
        isAvailable: true,
        productBranches: { some: { branchId: branch.id, isAvailable: true } },
      },
      include: { category: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.settings.findUnique({
      where: { restaurantId },
      select: { currencySymbol: true },
    }),
  ]);

  return {
    branch,
    categories,
    allProducts,
    currencySymbol: settings?.currencySymbol,
  };
}

export function resolvePreviewTheme(theme: string | null | undefined): MenuThemeSlug {
  if (theme && isMenuThemeSlug(theme)) {
    return theme;
  }
  return "classic";
}
