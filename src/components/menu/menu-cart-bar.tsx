"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CartItem } from "@/hooks/use-menu-cart";
import type { MenuThemeSlug } from "@/lib/menu-themes";

interface MenuCartBarProps {
  locale: string;
  currencySymbol?: string;
  sessionId: string | null;
  tableNumber?: number;
  menuTheme?: MenuThemeSlug;
  items: CartItem[];
  total: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClear: () => void;
}

export function MenuCartBar({
  locale,
  currencySymbol = "ج.م",
  sessionId,
  tableNumber,
  menuTheme = "classic",
  items,
  total,
  onUpdateQuantity,
  onClear,
}: MenuCartBarProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!tableNumber || items.length === 0) return null;

  const isAntika = menuTheme === "antika";
  const isBistro = menuTheme === "bistro";

  const barClass = isAntika
    ? "border-[#b67b31]/40 bg-[#2a160f]/95 text-[#f5eee3]"
    : isBistro
      ? "border-[#c9a84c]/25 bg-[#141210]/95 text-[#f5f0e8]"
      : "border-border bg-background/95";

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const submitOrder = async () => {
    if (!sessionId || !items.length) return;
    setSubmitting(true);

    try {
      const response = await fetch("/api/public/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          customerNote: note || undefined,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit order");
      }

      onClear();
      setNote("");
      setOpen(false);
      toast.success(locale === "ar" ? "تم إرسال الطلب" : "Order submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={cn("fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur-xl", barClass)}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "mx-auto flex w-full items-center gap-3 px-4 py-3.5",
            isAntika ? "max-w-5xl" : "max-w-4xl"
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 text-start">
            <p className="text-sm font-semibold">
              {locale === "ar" ? "سلة الطلب" : "Your order"}
            </p>
            <p className="text-xs opacity-80">
              {itemCount} {locale === "ar" ? "صنف" : "items"}
            </p>
          </div>
          <div className="text-end">
            <p className="text-base font-bold">
              {total.toFixed(2)} {currencySymbol}
            </p>
            <p className="text-xs opacity-80">
              {locale === "ar" ? "عرض السلة" : "View cart"}
            </p>
          </div>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setOpen(false)}>
          <Card
            className="absolute inset-x-4 bottom-24 max-h-[70vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <CardContent className="space-y-4 p-6">
              <h3 className="text-lg font-semibold">
                {locale === "ar" ? "سلة الطلب" : "Order Cart"}
              </h3>
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {locale === "ar" ? item.nameAr : item.nameEn}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.unitPrice.toFixed(2)} {currencySymbol}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span>{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              ))}
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={locale === "ar" ? "ملاحظات الطلب" : "Order notes"}
              />
              <Button className="w-full" disabled={submitting} onClick={submitOrder}>
                {submitting
                  ? locale === "ar"
                    ? "جاري الإرسال..."
                    : "Submitting..."
                  : locale === "ar"
                    ? "إرسال الطلب"
                    : "Submit Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
