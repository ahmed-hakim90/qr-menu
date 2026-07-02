"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product, Category } from "@/generated/prisma";

type ProductWithCategory = Product & { category: Category };

interface MenuSearchProps {
  products: ProductWithCategory[];
  locale: string;
  labels: {
    search: string;
    noResults: string;
    bestSeller: string;
    offers: string;
    new: string;
    hot: string;
    cold: string;
    vegetarian: string;
    vegan: string;
    spicy: string;
  };
  onFilter: (filtered: ProductWithCategory[]) => void;
}

type FilterKey = "isBestSeller" | "isOffer" | "isNew" | "isHot" | "isCold" | "isVegetarian" | "isVegan" | "isSpicy";

const FILTERS: { key: FilterKey; labelKey: keyof MenuSearchProps["labels"] }[] = [
  { key: "isBestSeller", labelKey: "bestSeller" },
  { key: "isOffer", labelKey: "offers" },
  { key: "isNew", labelKey: "new" },
  { key: "isHot", labelKey: "hot" },
  { key: "isCold", labelKey: "cold" },
  { key: "isVegetarian", labelKey: "vegetarian" },
  { key: "isVegan", labelKey: "vegan" },
  { key: "isSpicy", labelKey: "spicy" },
];

export function MenuSearch({ products, locale, labels, onFilter }: MenuSearchProps) {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>([]);

  const filtered = useMemo(() => {
    let result = products;

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((p) => {
        const name = locale === "ar" ? p.nameAr : p.nameEn;
        const desc = locale === "ar" ? p.descriptionAr : p.descriptionEn;
        const cat = locale === "ar" ? p.category.nameAr : p.category.nameEn;
        return (
          name.toLowerCase().includes(q) ||
          desc?.toLowerCase().includes(q) ||
          cat.toLowerCase().includes(q)
        );
      });
    }

    if (activeFilters.length > 0) {
      result = result.filter((p) =>
        activeFilters.every((f) => p[f] === true)
      );
    }

    return result;
  }, [products, query, activeFilters, locale]);

  useEffect(() => {
    onFilter(filtered);
  }, [filtered, onFilter]);

  const toggleFilter = (key: FilterKey) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-4 sticky top-0 z-30 bg-background/80 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-border/50">
      <div className="relative">
        <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.search}
          className="ps-11 pe-11"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTERS.map(({ key, labelKey }) => (
          <Button
            key={key}
            variant={activeFilters.includes(key) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter(key)}
            className={cn("shrink-0 rounded-full", activeFilters.includes(key) && "shadow-md")}
          >
            {labels[labelKey]}
          </Button>
        ))}
      </div>
    </div>
  );
}
