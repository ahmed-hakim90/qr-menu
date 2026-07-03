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
  categories: Category[];
  locale: string;
  labels: {
    search: string;
    allItems: string;
  };
  categoryButtonClass?: {
    active: string;
    inactive: string;
  };
  stickyTopClass?: string;
  onFilterChange: (state: {
    query: string;
    categoryId: string | null;
    filteredProducts: ProductWithCategory[];
    isSearchActive: boolean;
  }) => void;
  onCategorySelect?: (categoryId: string | null) => void;
}

const normalizeSearchText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/\u0640/g, "")
    .replace(/[\u0623\u0625\u0622\u0671]/g, "\u0627")
    .replace(/\u0629/g, "\u0647")
    .replace(/\u0649/g, "\u064A")
    .replace(/\u0624/g, "\u0648")
    .replace(/\u0626/g, "\u064A");

export function MenuSearch({
  products,
  categories,
  locale,
  labels,
  categoryButtonClass,
  stickyTopClass = "top-0",
  onFilterChange,
  onCategorySelect,
}: MenuSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const isSearchActive = query.trim().length > 0;

  const filtered = useMemo(() => {
    let result = products;

    if (isSearchActive) {
      const q = normalizeSearchText(query);
      result = result.filter((p) => {
        const haystack = [
          p.nameAr,
          p.nameEn,
          p.descriptionAr,
          p.descriptionEn,
          p.category.nameAr,
          p.category.nameEn,
        ];
        return haystack.some((field) => field && normalizeSearchText(field).includes(q));
      });
    }

    if (selectedCategoryId) {
      result = result.filter((p) => p.categoryId === selectedCategoryId);
    }

    return result;
  }, [products, query, selectedCategoryId, isSearchActive]);

  useEffect(() => {
    onFilterChange({
      query,
      categoryId: selectedCategoryId,
      filteredProducts: filtered,
      isSearchActive,
    });
  }, [filtered, query, selectedCategoryId, isSearchActive, onFilterChange]);

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    onCategorySelect?.(categoryId);
  };

  const activeClass = categoryButtonClass?.active ?? "bg-primary text-primary-foreground shadow-md";
  const inactiveClass =
    categoryButtonClass?.inactive ?? "bg-muted text-muted-foreground hover:bg-muted/80";

  return (
    <div className={cn("space-y-4 sticky z-30 bg-background/80 backdrop-blur-xl py-4 -mx-4 px-4 border-b border-border/50", stickyTopClass)}>
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
        <Button
          variant={selectedCategoryId === null ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryClick(null)}
          className={cn(
            "shrink-0 rounded-full",
            selectedCategoryId === null ? activeClass : inactiveClass
          )}
        >
          {labels.allItems}
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategoryId === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryClick(category.id)}
            className={cn(
              "shrink-0 rounded-full",
              selectedCategoryId === category.id ? activeClass : inactiveClass
            )}
          >
            {locale === "ar" ? category.nameAr : category.nameEn}
          </Button>
        ))}
      </div>
    </div>
  );
}
