"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Share2, Link2, Heart, Clock, Flame, Thermometer } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { ProductBadges } from "./product-badges";
import { useFavorites } from "@/hooks/use-favorites";
import { formatPrice, cn } from "@/lib/utils";
import type { Branch, Restaurant, Product, Category, ProductImage, ProductSize, ProductAddon, Size, Addon } from "@/generated/prisma";

type ProductDetail = Product & {
  category: Category;
  images: ProductImage[];
  productSizes: (ProductSize & { size: Size })[];
  productAddons: (ProductAddon & { addon: Addon })[];
};

interface ProductDetailViewProps {
  product: ProductDetail;
  branch: Branch & { restaurant: Restaurant };
  currencySymbol?: string;
}

export function ProductDetailView({ product, branch, currencySymbol }: ProductDetailViewProps) {
  const t = useTranslations();
  const locale = useLocale();
  const currency = currencySymbol || t("common.currency");
  const { toggleFavorite, isFavorite } = useFavorites();
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const description = locale === "ar" ? product.descriptionAr : product.descriptionEn;
  const ingredients = locale === "ar" ? product.ingredientsAr : product.ingredientsEn;
  const allergens = locale === "ar" ? product.allergensAr : product.allergensEn;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  const allImages = [
    ...(product.image ? [product.image] : []),
    ...product.images.map((img) => img.url),
  ];

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: name, url: window.location.href });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badgeLabels = {
    bestSeller: t("badges.bestSeller"),
    new: t("badges.new"),
    offer: t("badges.offer"),
    spicy: t("badges.spicy"),
    vegetarian: t("badges.vegetarian"),
    vegan: t("badges.vegan"),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/menu/${branch.slug}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleCopyLink}>
            <Link2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleFavorite(product.id)}
          >
            <Heart className={cn("h-5 w-5", isFavorite(product.id) && "fill-red-500 text-red-500")} />
          </Button>
        </div>
      </div>

      {copied && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-4 py-2 rounded-full text-sm"
        >
          {t("common.copied")}
        </motion.div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="relative aspect-square overflow-hidden">
          {allImages.length > 0 ? (
            <Image
              src={allImages[selectedImage]}
              alt={name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-6xl">🍽️</div>
          )}
        </div>

        {allImages.length > 1 && (
          <div className="flex gap-2 p-4 overflow-x-auto">
            {allImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                  selectedImage === i ? "border-primary" : "border-transparent opacity-60"
                )}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}

        <div className="p-6 space-y-6">
          <div>
            <ProductBadges product={product} labels={badgeLabels} />
            <h1 className="text-3xl font-bold mt-3">{name}</h1>
            {description && (
              <p className="text-muted-foreground mt-2 leading-relaxed">{description}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(product.price, currency)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice!, currency)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {product.calories && (
              <div className="rounded-2xl bg-muted/50 p-3 text-sm">
                <span className="text-muted-foreground">{t("menu.calories")}</span>
                <p className="font-semibold">{product.calories}</p>
              </div>
            )}
            {product.prepTime && (
              <div className="rounded-2xl bg-muted/50 p-3 text-sm flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">{t("menu.prepTime")}</span>
                  <p className="font-semibold">{product.prepTime} {t("menu.minutes")}</p>
                </div>
              </div>
            )}
            {product.spiceLevel && (
              <div className="rounded-2xl bg-muted/50 p-3 text-sm flex items-start gap-2">
                <Flame className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">{t("menu.spiceLevel")}</span>
                  <p className="font-semibold">{"🌶️".repeat(product.spiceLevel)}</p>
                </div>
              </div>
            )}
            {product.temperature && (
              <div className="rounded-2xl bg-muted/50 p-3 text-sm flex items-start gap-2">
                <Thermometer className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <span className="text-muted-foreground">{t("menu.temperature")}</span>
                  <p className="font-semibold">{product.temperature}</p>
                </div>
              </div>
            )}
          </div>

          {ingredients && (
            <div>
              <h3 className="font-semibold mb-2">{t("menu.ingredients")}</h3>
              <p className="text-muted-foreground leading-relaxed">{ingredients}</p>
            </div>
          )}

          {allergens && (
            <div>
              <h3 className="font-semibold mb-2">{t("menu.allergens")}</h3>
              <p className="text-muted-foreground leading-relaxed">{allergens}</p>
            </div>
          )}

          {product.productSizes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">{t("menu.sizes")}</h3>
              <div className="flex flex-wrap gap-2">
                {product.productSizes.map((ps) => (
                  <div key={ps.id} className="rounded-2xl border border-border px-4 py-2 text-sm">
                    <span className="font-medium">
                      {locale === "ar" ? ps.size.nameAr : ps.size.nameEn}
                    </span>
                    {ps.price && (
                      <span className="text-primary ms-2 font-semibold">
                        {formatPrice(ps.price, currency)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.productAddons.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">{t("menu.addons")}</h3>
              <div className="space-y-2">
                {product.productAddons.map((pa) => (
                  <div key={pa.id} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3">
                    <span>{locale === "ar" ? pa.addon.nameAr : pa.addon.nameEn}</span>
                    <span className="text-primary font-semibold">
                      +{formatPrice(pa.addon.price, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
