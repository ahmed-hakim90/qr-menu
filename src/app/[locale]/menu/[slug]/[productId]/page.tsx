import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ProductDetailView } from "@/components/menu/product-detail-view";

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string; productId: string }>;
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

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug, productId } = await params;

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

  return <ProductDetailView product={product} branch={branch} />;
}
