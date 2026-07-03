"use client";

import { useState, useCallback } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Plus } from "lucide-react";
import { MenuHeader } from "./menu-header";
import { MenuSearch } from "./menu-search";
import { ProductCard } from "./product-card";
import { MenuCartBar } from "./menu-cart-bar";
import { MenuReservation } from "./menu-reservation";
import { useMenuCart } from "@/hooks/use-menu-cart";
import { useTableSession } from "@/hooks/use-table-session";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getMenuTheme, type MenuThemeSlug } from "@/lib/menu-themes";
import type { Branch, Restaurant, Category, Product } from "@/generated/prisma";

type BranchWithRestaurant = Branch & { restaurant: Restaurant };
type ProductWithCategory = Product & { category: Category };

interface MenuViewProps {
  branch: BranchWithRestaurant;
  categories: (Category & { products: Product[] })[];
  allProducts: ProductWithCategory[];
  currencySymbol?: string;
  tableNumber?: number;
  menuTheme?: MenuThemeSlug;
}

export function MenuView({
  branch,
  categories,
  allProducts,
  currencySymbol,
  tableNumber,
  menuTheme = "classic",
}: MenuViewProps) {
  const t = useTranslations();
  const locale = useLocale();
  const theme = getMenuTheme(menuTheme);
  const isListLayout = theme.layout === "list";
  const isAntika = menuTheme === "antika";
  const { toggleFavorite, isFavorite } = useFavorites();
  const { items, addItem, updateQuantity, clear, total } = useMenuCart();
  const { sessionId, requestBill, callWaiter } = useTableSession(branch.slug, tableNumber);
  const [searchState, setSearchState] = useState({
    query: "",
    categoryId: null as string | null,
    filteredProducts: [] as ProductWithCategory[],
    isSearchActive: false,
  });

  const handleFilterChange = useCallback(
    (state: {
      query: string;
      categoryId: string | null;
      filteredProducts: ProductWithCategory[];
      isSearchActive: boolean;
    }) => {
      setSearchState(state);
    },
    []
  );

  const isSearching = searchState.isSearchActive;
  const activeCategory = searchState.categoryId;
  const displayCategories = categories.filter((c) => c.isVisible && c.products.length > 0);
  const themedStyle = {
    "--primary": branch.primaryColor || theme.previewColors.primary,
    "--ring": branch.primaryColor || theme.previewColors.primary,
    "--secondary": branch.secondaryColor || theme.previewColors.accent,
  } as CSSProperties;

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

  const renderProduct = (product: ProductWithCategory | Product, category?: Category) => {
    const productWithCategory: ProductWithCategory = category
      ? { ...product, category }
      : (product as ProductWithCategory);

    if (isListLayout) {
      return (
        <MenuListProductRow
          key={product.id}
          product={productWithCategory}
          locale={locale}
          branchSlug={branch.slug}
          tableNumber={tableNumber}
          currencySymbol={badgeLabels.currency}
          variant={isAntika ? "antika" : "minimal"}
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
      );
    }

    return (
      <ProductCard
        key={product.id}
        product={productWithCategory}
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
    );
  };

  const inactiveCategoryClass = isAntika
    ? "bg-[#fffaf1] text-[#2a160f] border border-[#d7c7b2] hover:bg-[#f0dfc4]"
    : menuTheme === "bistro"
      ? "bg-[#1c1915] text-[#f5f0e8] border border-[#c9a84c]/25 hover:bg-[#252018]"
      : "bg-muted text-muted-foreground hover:bg-muted/80";

  const handleCategorySelect = (categoryId: string | null) => {
    if (isAntika) {
      const target = categoryId ? document.getElementById(categoryId) : document.querySelector("[data-menu-top]");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className={cn("min-h-screen bg-background", theme.cssClass)}
      style={themedStyle}
    >
      <MenuHeader
        branch={branch}
        locale={locale}
        menuTheme={menuTheme}
        tableNumber={tableNumber}
        sessionId={sessionId}
        onRequestBill={requestBill}
        onCallWaiter={callWaiter}
        labels={{
          hours: t("menu.hours"),
          contact: t("menu.contact"),
          maps: t("menu.maps"),
          review: t("menu.review"),
          reservationPhone: t("menu.reservationPhone"),
        }}
      />

      <div
        data-menu-top
        className={cn(
          isAntika ? "max-w-5xl" : "max-w-4xl",
          "mx-auto px-4",
          tableNumber && items.length > 0 ? "pb-24" : tableNumber ? "pb-10" : "pb-28"
        )}
      >
        <MenuSearch
          products={allProducts}
          categories={displayCategories}
          locale={locale}
          labels={{
            search: t("common.search"),
            allItems: t("menu.allItems"),
          }}
          categoryButtonClass={{
            active: "bg-primary text-primary-foreground shadow-md",
            inactive: inactiveCategoryClass,
          }}
          onFilterChange={handleFilterChange}
          onCategorySelect={handleCategorySelect}
        />

        {isSearching ? (
          <div className="mt-6">
            {searchState.filteredProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">{t("common.noResults")}</p>
            ) : (
              <div className={cn(isListLayout ? "grid gap-2" : "grid grid-cols-2 gap-4")}>
                {searchState.filteredProducts.map((product) => renderProduct(product))}
              </div>
            )}
          </div>
        ) : (
          <>
            {displayCategories
              .filter((cat) => isAntika || !activeCategory || cat.id === activeCategory)
              .map((category) => (
                <section
                  key={category.id}
                  id={category.id}
                  className={cn(isAntika ? "antika-category-block mb-12" : "mb-10")}
                >
                  {isAntika ? (
                    <div className="antika-category-heading mb-4">
                      {category.image && (
                        <div className="relative h-16 w-20 shrink-0 overflow-hidden border border-[#d7c7b2] bg-[#fffaf1] sm:h-20 sm:w-28">
                          <Image
                            src={category.image}
                            alt={locale === "ar" ? category.nameAr : category.nameEn}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 80px, 112px"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h2 className="antika-section-title">
                          <span>{category.nameEn}</span>
                          <span>{category.nameAr}</span>
                        </h2>
                        <p className="mt-1 text-xs text-[#6f5640]">
                          {locale === "ar" ? "قسم مستقل من المنيو" : "Dedicated menu category"}
                        </p>
                      </div>
                      <span className="shrink-0 border border-[#d7c7b2] bg-[#fffaf1] px-3 py-1 text-xs font-semibold text-[#6f5640]">
                        {category.products.filter((p) => p.isAvailable).length} {locale === "ar" ? "صنف" : "items"}
                      </span>
                    </div>
                  ) : (
                    <h2
                      className={cn(
                        "text-xl font-bold mb-4 sticky top-[120px] z-10 py-2",
                        menuTheme === "bistro"
                          ? "bg-[#141210]/90 backdrop-blur-xl text-[#f5f0e8]"
                          : "bg-background/80 backdrop-blur-xl"
                      )}
                    >
                      {locale === "ar" ? category.nameAr : category.nameEn}
                    </h2>
                  )}
                  <div className={cn(isAntika ? "antika-category-products" : isListLayout ? "grid gap-2" : "grid grid-cols-2 gap-4")}>
                    {category.products
                      .filter((p) => p.isAvailable)
                      .map((product) => renderProduct(product, category))}
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
        menuTheme={menuTheme}
        items={items}
        total={total}
        onUpdateQuantity={updateQuantity}
        onClear={clear}
      />

      {!tableNumber && (
        <MenuReservation
          branchSlug={branch.slug}
          locale={locale}
          reservationPhone={branch.reservationPhone}
          labels={{
            book: t("menu.bookTable"),
            title: t("menu.reservationTitle"),
            name: t("menu.reservationName"),
            phone: t("menu.reservationCustomerPhone"),
            partySize: t("menu.reservationPartySize"),
            dateTime: t("menu.reservationDateTime"),
            notes: t("menu.reservationNotes"),
            submit: t("menu.reservationSubmit"),
            submitting: t("menu.reservationSubmitting"),
            success: t("menu.reservationSuccess"),
            callToReserve: t("menu.callToReserve"),
          }}
        />
      )}
    </div>
  );
}

function MenuListProductRow({
  product,
  locale,
  branchSlug,
  tableNumber,
  currencySymbol,
  variant,
  onAddToCart,
}: {
  product: ProductWithCategory;
  locale: string;
  branchSlug: string;
  tableNumber?: number;
  currencySymbol: string;
  variant: "antika" | "minimal";
  onAddToCart?: (product: ProductWithCategory) => void;
}) {
  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const alternateName = locale === "ar" ? product.nameEn : product.nameAr;
  const tableQuery = tableNumber ? `?table=${tableNumber}` : "";
  const productImage = product.image || product.category?.image || "/brands/antika/cover.png";

  if (variant === "antika") {
    return (
      <div className="antika-product-row group">
        <Link
          href={`/menu/${branchSlug}/${product.id}${tableQuery}`}
          className="relative h-14 w-14 shrink-0 overflow-hidden border border-[#d7c7b2] bg-[#fffaf1] sm:h-16 sm:w-16"
        >
          <Image
            src={productImage}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="64px"
          />
        </Link>
        <Link href={`/menu/${branchSlug}/${product.id}${tableQuery}`} className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-[#2a160f] sm:text-base">{name}</p>
              <p className="truncate text-xs text-[#6f5640]">{alternateName}</p>
            </div>
            <div className="h-px min-w-8 flex-1 bg-[#2a160f]/35 transition-colors group-hover:bg-[#b67b31]" />
            <span className="shrink-0 font-serif text-base text-[#b67b31]">
              {formatPrice(product.price, currencySymbol)}
            </span>
          </div>
        </Link>
        {onAddToCart && (
          <Button
            size="sm"
            className="h-8 w-8 rounded-full bg-[#2a160f] p-0 text-[#f5eee3] hover:bg-[#b67b31]"
            onClick={() => onAddToCart(product)}
            aria-label={locale === "ar" ? "أضف للسلة" : "Add to cart"}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="minimal-product-row group">
      <Link href={`/menu/${branchSlug}/${product.id}${tableQuery}`} className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{name}</p>
            {alternateName && (
              <p className="truncate text-xs text-muted-foreground">{alternateName}</p>
            )}
          </div>
          <span className="shrink-0 font-semibold text-primary">
            {formatPrice(product.price, currencySymbol)}
          </span>
        </div>
      </Link>
      {onAddToCart && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 rounded-full p-0"
          onClick={() => onAddToCart(product)}
          aria-label={locale === "ar" ? "أضف للسلة" : "Add to cart"}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
