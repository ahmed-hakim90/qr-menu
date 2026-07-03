import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ProductDetailView } from "@/components/menu/product-detail-view";

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string; productId: string }>;
  searchParams: Promise<{ table?: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.nameEn,
    description: product.descriptionEn || undefined,
    openGraph: {
      title: product.nameEn,
      description: product.descriptionEn || undefined,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const { slug, productId } = await params;
  const query = await searchParams;
  const tableNumber = query.table ? Number(query.table) : undefined;

  const branch = await db.branch.findUnique({
    where: { slug, isActive: true },
    include: { restaurant: true },
  });

  if (!branch) notFound();

  const product = await db.product.findUnique({
    where: { id: productId, restaurantId: branch.restaurantId },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      productSizes: { include: { size: true } },
      productAddons: { include: { addon: true } },
    },
  });

  if (!product || !product.isAvailable) notFound();

  const settings = await db.settings.findUnique({
    where: { restaurantId: branch.restaurantId },
  });

  const themePurchases = await db.themePurchase.findMany({
    where: { restaurantId: branch.restaurantId, status: "ACTIVE" },
    select: { themeSlug: true, status: true },
  });

  const { resolveMenuThemeForDisplay } = await import(
    "@/features/themes/services/theme-service"
  );
  const menuTheme = await resolveMenuThemeForDisplay(settings?.menuTheme, themePurchases);

  return (
    <ProductDetailView
      product={product}
      branch={branch}
      currencySymbol={settings?.currencySymbol}
      tableNumber={Number.isFinite(tableNumber) ? tableNumber : undefined}
      menuTheme={menuTheme}
    />
  );
}
