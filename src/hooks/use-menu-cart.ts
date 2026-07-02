"use client";

import { useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  nameAr: string;
  nameEn: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
};

export function useMenuCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.productId === item.productId);
      if (existing) {
        return current.map((entry) =>
          entry.productId === item.productId
            ? { ...entry, quantity: entry.quantity + (item.quantity ?? 1) }
            : entry
        );
      }
      return [...current, { ...item, quantity: item.quantity ?? 1 }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((entry) => (entry.productId === productId ? { ...entry, quantity } : entry))
        .filter((entry) => entry.quantity > 0)
    );
  };

  const clear = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  return { items, addItem, updateQuantity, clear, total, count: items.length };
}
