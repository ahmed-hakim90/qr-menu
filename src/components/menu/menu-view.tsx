"use client";

import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { MenuHeader } from "./menu-header";
import { MenuSearch } from "./menu-search";
import { ProductCard } from "./product-card";
import { MenuCartBar } from "./menu-cart-bar";
import { useMenuCart } from "@/hooks/use-menu-cart";
import { useTableSession } from "@/hooks/use-table-session";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";
import type { Branch, Restaurant, Category, Product } from "@/generated/prisma";

type BranchWithRestaurant = Branch & { restaurant: Restaurant };
type ProductWithCategory = Product & { category: Category };

interface MenuViewProps {
  branch: BranchWithRestaurant;
  categories: (Category & { products: Product[] })[];
  allProducts: ProductWithCategory[];
  currencySymbol?: string;
  tableNumber?: number;
}

export function MenuView({ branch, categories, allProducts, currencySymbol, tableNumber }: MenuViewProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { items, addItem, updateQuantity, clear, total } = useMenuCart();
  const { sessionId, requestBill, callWaiter } = useTableSession(branch.slug, tableNumber);
  const [filteredProducts, setFilteredProducts] = useState<ProductWithCategory[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleFilter = useCallback((filtered: ProductWithCategory[]) => {
    setFilteredProducts(filtered);
  }, []);

  const isSearching = filteredProducts !== null;
  const displayCategories = isSearching
    ? []
    : categories.filter((c) => c.isVisible && c.products.length > 0);

  const badgeLabels = {
    bestSeller: t("badges.bestSeller"),
    new: t("badges.new"),
    offer: t("badges.offer"),
    spicy: t("badges.spicy"),
    vegetarian: t("badges.vegetarian"),
    vegan: t("badges.vegan"),
    addToFavorites: t("common.addToFavorites"),
    removeFromFavorites: t("common.removeFromFavorites"),
    currency: currencySymbol || t("common.currency"),
  };

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader
        branch={branch}
        locale={locale}
        labels={{
          hours: t("menu.hours"),
          contact: t("menu.contact"),
        }}
      />

      <div className="max-w-4xl mx-auto px-4 pb-20">
        <MenuSearch
          products={allProducts}
          locale={locale}
          labels={{
            search: t("common.search"),
            noResults: t("common.noResults"),
            bestSeller: t("filters.bestSeller"),
            offers: t("filters.offers"),
            new: t("filters.new"),
            hot: t("filters.hot"),
            cold: t("filters.cold"),
            vegetarian: t("filters.vegetarian"),
            vegan: t("filters.vegan"),
            spicy: t("filters.spicy"),
          }}
          onFilter={handleFilter}
        />

        {isSearching ? (
          <div className="mt-6">
            {filteredProducts!.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">{t("common.noResults")}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts!.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={locale}
                    branchSlug={branch.slug}
                    tableNumber={tableNumber}
                    labels={badgeLabels}
                    isFavorite={isFavorite(product.id)}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={
                      tableNumber
                        ? (product) =>
                            addItem({
                              productId: product.id,
                              nameAr: product.nameAr,
                              nameEn: product.nameEn,
                              unitPrice: product.price,
                            })
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto py-4 scrollbar-hide sticky top-[120px] z-20 bg-background/80 backdrop-blur-xl -mx-4 px-4">
              <button
                onClick={() => setActiveCategory(null)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
                  activeCategory === null
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {t("menu.allItems")}
              </button>
              {displayCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {locale === "ar" ? cat.nameAr : cat.nameEn}
                </button>
              ))}
            </div>

            {displayCategories
              .filter((cat) => !activeCategory || cat.id === activeCategory)
              .map((category) => (
                <section key={category.id} id={category.id} className="mb-10">
                  <h2 className="text-xl font-bold mb-4 sticky top-[180px] z-10 bg-background/80 backdrop-blur-xl py-2">
                    {locale === "ar" ? category.nameAr : category.nameEn}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {category.products
                      .filter((p) => p.isAvailable)
                      .map((product) => (
                        <ProductCard
                          key={product.id}
                          product={{ ...product, category }}
                          locale={locale}
                          branchSlug={branch.slug}
                          tableNumber={tableNumber}
                          labels={badgeLabels}
                          isFavorite={isFavorite(product.id)}
                          onToggleFavorite={toggleFavorite}
                          onAddToCart={
                            tableNumber
                              ? (product) =>
                                  addItem({
                                    productId: product.id,
                                    nameAr: product.nameAr,
                                    nameEn: product.nameEn,
                                    unitPrice: product.price,
                                  })
                              : undefined
                          }
                        />
                      ))}
                  </div>
                </section>
              ))}
          </>
        )}
      </div>

      <MenuCartBar
        locale={locale}
        currencySymbol={currencySymbol}
        sessionId={sessionId}
        tableNumber={tableNumber}
        items={items}
        total={total}
        onUpdateQuantity={updateQuantity}
        onClear={clear}
        onRequestBill={requestBill}
        onCallWaiter={callWaiter}
      />
    </div>
  );
}
