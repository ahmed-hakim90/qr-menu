import { CashPaymentProvider } from "./cash";
import { PaymobPaymentProvider } from "./paymob";
import type { PaymentProvider } from "./types";

const providers: Record<"CASH" | "PAYMOB", PaymentProvider> = {
  CASH: new CashPaymentProvider(),
  PAYMOB: new PaymobPaymentProvider(),
};

export function getPaymentProvider(name: "CASH" | "PAYMOB") {
  return providers[name];
}

export * from "./types";
