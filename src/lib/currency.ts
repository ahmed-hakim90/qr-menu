export const CURRENCY_CODE = "EGP";
export const CURRENCY_SYMBOL = "ج.م";
export const CURRENCY_LABEL_AR = "جنيه مصري";
export const CURRENCY_LABEL_EN = "Egyptian Pound";

export function formatCurrencyAmount(price: number) {
  return `${price.toFixed(2)} ${CURRENCY_SYMBOL}`;
}
