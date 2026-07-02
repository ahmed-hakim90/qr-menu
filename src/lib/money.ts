export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateLineTotal(quantity: number, unitPrice: number) {
  return roundMoney(quantity * unitPrice);
}

export function calculateOrderTotals(
  items: Array<{ quantity: number; unitPrice: number }>,
  taxRate = 0
) {
  const subtotal = roundMoney(
    items.reduce((sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice), 0)
  );
  const taxTotal = roundMoney(subtotal * (taxRate / 100));
  const total = roundMoney(subtotal + taxTotal);

  return { subtotal, taxTotal, total };
}
