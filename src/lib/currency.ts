export const CURRENCY_CODE = "EGP";
export const CURRENCY_SYMBOL = "ج.م";
export const CURRENCY_LABEL_AR = "جنيه مصري";
export const CURRENCY_LABEL_EN = "Egyptian Pound";

/** 1 EGP = 100 piasters (for Paymob conversion only). */
export const PIASTERS_PER_EGP = 100;

export function formatCurrencyAmount(price: number) {
  return `${price.toFixed(2)} ${CURRENCY_SYMBOL}`;
}

export function egpToPiasters(egp: number) {
  return Math.round(egp * PIASTERS_PER_EGP);
}
