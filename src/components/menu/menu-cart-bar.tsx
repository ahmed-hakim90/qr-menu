"use client";

import { useState } from "react";
import { BellRing, CreditCard, Receipt, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { CartItem } from "@/hooks/use-menu-cart";

interface MenuCartBarProps {
  locale: string;
  currencySymbol?: string;
  sessionId: string | null;
  tableNumber?: number;
  items: CartItem[];
  total: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onClear: () => void;
  onRequestBill: () => Promise<unknown>;
  onCallWaiter: () => Promise<unknown>;
}

export function MenuCartBar({
  locale,
  currencySymbol = "ج.م",
  sessionId,
  tableNumber,
  items,
  total,
  onUpdateQuantity,
  onClear,
  onRequestBill,
  onCallWaiter,
}: MenuCartBarProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!tableNumber) return null;

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
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center gap-2 p-4">
          <Button variant="outline" onClick={() => setOpen(true)}>
            <ShoppingBag className="h-4 w-4" />
            {items.length}
          </Button>
          <Button
            variant="outline"
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
          </Button>
          <Button
            variant="outline"
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
          </Button>
          <Button variant="outline" onClick={payWithPaymob}>
            <CreditCard className="h-4 w-4" />
            Paymob
          </Button>
          <div className="ms-auto text-sm font-semibold">
            {total.toFixed(2)} {currencySymbol}
          </div>
        </div>
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
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {locale === "ar" ? "لا توجد عناصر بعد" : "No items yet"}
                </p>
              ) : (
                items.map((item) => (
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
                ))
              )}
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={locale === "ar" ? "ملاحظات الطلب" : "Order notes"}
              />
              <Button className="w-full" disabled={submitting || !items.length} onClick={submitOrder}>
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
