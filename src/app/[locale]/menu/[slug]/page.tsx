import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { MenuView } from "@/components/menu/menu-view";

interface MenuPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
  const { slug } = await params;
  const branch = await db.branch.findUnique({
    where: { slug },
    include: { restaurant: true },
  });

  if (!branch) return { title: "Menu Not Found" };

  return {
    title: `${branch.nameEn} - ${branch.restaurant.nameEn}`,
    description: branch.restaurant.descriptionEn || `Digital menu for ${branch.nameEn}`,
    openGraph: {
      title: branch.nameEn,
      description: branch.restaurant.descriptionEn || undefined,
      images: branch.coverImage ? [branch.coverImage] : [],
      type: "website",
    },
  };
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { slug } = await params;

  const branch = await db.branch.findUnique({
    where: { slug, isActive: true },
    include: {
      restaurant: true,
      productBranches: {
        include: {
          product: {
            include: {
              category: true,
              images: { orderBy: { sortOrder: "asc" } },
              productSizes: { include: { size: true } },
              productAddons: { include: { addon: true } },
            },
          },
        },
      },
    },
  });

  if (!branch) notFound();

  const categories = await db.category.findMany({
    where: {
      restaurantId: branch.restaurantId,
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
  });

  const allProducts = await db.product.findMany({
    where: {
      restaurantId: branch.restaurantId,
      isAvailable: true,
      productBranches: { some: { branchId: branch.id, isAvailable: true } },
    },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });

  const settings = await db.settings.findUnique({
    where: { restaurantId: branch.restaurantId },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: branch.nameEn,
    description: branch.restaurant.descriptionEn,
    image: branch.coverImage || branch.restaurant.coverImage,
    telephone: branch.phone,
    address: branch.addressEn,
    servesCuisine: "Various",
    menu: `${process.env.NEXT_PUBLIC_APP_URL}/menu/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MenuView
        branch={branch}
        categories={categories}
        allProducts={allProducts}
        currencySymbol={settings?.currencySymbol}
      />
    </>
  );
}
