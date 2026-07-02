"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductBadges } from "./product-badges";
import { formatPrice, cn } from "@/lib/utils";
import type { Product, Category } from "@/generated/prisma";

type ProductCardData = Product & {
  category?: Category;
};

interface ProductCardProps {
  product: ProductCardData;
  locale: string;
  branchSlug: string;
  tableNumber?: number;
  labels: {
    bestSeller: string;
    new: string;
    offer: string;
    spicy: string;
    vegetarian: string;
    vegan: string;
    addToFavorites: string;
    removeFromFavorites: string;
    currency: string;
  };
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onAddToCart?: (product: ProductCardData) => void;
}

export function ProductCard({
  product,
  locale,
  branchSlug,
  tableNumber,
  labels,
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const name = locale === "ar" ? product.nameAr : product.nameEn;
  const description = locale === "ar" ? product.descriptionAr : product.descriptionEn;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  const tableQuery = tableNumber ? `?table=${tableNumber}` : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={`/menu/${branchSlug}/${product.id}${tableQuery}`} className="group block">
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border/50 shadow-lg shadow-black/5 transition-all duration-300 hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1">
          <div className="relative aspect-[4/3] overflow-hidden">
            {product.image && !imgError ? (
              <Image
                src={product.image}
                alt={name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted text-muted-foreground text-4xl">
                🍽️
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleFavorite(product.id);
                }}
                className={cn(
                  "absolute top-3 end-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all",
                  isFavorite
                    ? "bg-red-500 text-white"
                    : "bg-white/20 text-white hover:bg-white/40"
                )}
                aria-label={isFavorite ? labels.removeFromFavorites : labels.addToFavorites}
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </button>
            )}
            <div className="absolute bottom-3 start-3 end-3">
              <ProductBadges product={product} labels={labels} />
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
              {name}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {description}
              </p>
            )}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {formatPrice(product.price, labels.currency)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice!, labels.currency)}
                  </span>
                )}
              </div>
              {onAddToCart && (
                <Button
                  size="sm"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onAddToCart(product);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
