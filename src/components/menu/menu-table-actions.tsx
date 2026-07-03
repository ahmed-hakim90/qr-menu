"use client";

import { BellRing, CreditCard, Receipt } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { MenuThemeSlug } from "@/lib/menu-themes";

interface MenuTableActionsProps {
  locale: string;
  menuTheme?: MenuThemeSlug;
  sessionId: string | null;
  onRequestBill: () => Promise<unknown>;
  onCallWaiter: () => Promise<unknown>;
}

export function MenuTableActions({
  locale,
  menuTheme = "classic",
  sessionId,
  onRequestBill,
  onCallWaiter,
}: MenuTableActionsProps) {
  const isAntika = menuTheme === "antika";
  const isBistro = menuTheme === "bistro";

  const btnClass = isAntika
    ? "h-9 border-[#d7c7b2] bg-[#fffaf1] text-xs text-[#2a160f] sm:text-sm hover:bg-[#f0dfc4]"
    : isBistro
      ? "h-9 border-[#c9a84c]/30 bg-[#1c1915] text-xs text-[#f5f0e8] sm:text-sm hover:bg-[#252018]"
      : "h-9 text-xs sm:text-sm";

  const payWithPaymob = async () => {
    if (!sessionId) return;

    try {
      const response = await fetch("/api/public/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          provider: "PAYMOB",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }
      if (data.providerCheckoutUrl) {
        window.location.href = data.providerCheckoutUrl;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        className={btnClass}
        onClick={async () => {
          try {
            await onCallWaiter();
            toast.success(locale === "ar" ? "تم استدعاء النادل" : "Waiter notified");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed");
          }
        }}
      >
        <BellRing className="h-4 w-4" />
        {locale === "ar" ? "استدعاء النادل" : "Call waiter"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={btnClass}
        onClick={async () => {
          try {
            await onRequestBill();
            toast.success(locale === "ar" ? "تم طلب الحساب" : "Bill requested");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed");
          }
        }}
      >
        <Receipt className="h-4 w-4" />
        {locale === "ar" ? "طلب الحساب" : "Request bill"}
      </Button>
      <Button variant="outline" size="sm" className={btnClass} onClick={payWithPaymob}>
        <CreditCard className="h-4 w-4" />
        Paymob
      </Button>
    </div>
  );
}
