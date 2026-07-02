import { describe, expect, it } from "vitest";

type CartItem = {
  productId: string;
  nameAr: string;
  nameEn: string;
  unitPrice: number;
  quantity: number;
};

function addCartItem(
  items: CartItem[],
  item: Omit<CartItem, "quantity"> & { quantity?: number }
) {
  const existing = items.find((entry) => entry.productId === item.productId);
  if (existing) {
    return items.map((entry) =>
      entry.productId === item.productId
        ? { ...entry, quantity: entry.quantity + (item.quantity ?? 1) }
        : entry
    );
  }
  return [...items, { ...item, quantity: item.quantity ?? 1 }];
}

function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

describe("menu cart success flow", () => {
  it("adds items and computes total for order submission", () => {
    const first = addCartItem([], {
      productId: "p1",
      nameAr: "برجر",
      nameEn: "Burger",
      unitPrice: 120,
    });

    const second = addCartItem(first, {
      productId: "p1",
      nameAr: "برجر",
      nameEn: "Burger",
      unitPrice: 120,
    });

    const withDrink = addCartItem(second, {
      productId: "p2",
      nameAr: "عصير",
      nameEn: "Juice",
      unitPrice: 40,
    });

    expect(second).toHaveLength(1);
    expect(second[0].quantity).toBe(2);
    expect(withDrink).toHaveLength(2);
    expect(cartTotal(withDrink)).toBe(280);
  });
});
