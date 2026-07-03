"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Check, Crown, Lock, Palette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/dashboard-api";
import { formatCurrencyAmount } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { MenuThemeSlug } from "@/lib/menu-themes";
import type { ThemePurchaseStatus } from "@/generated/prisma";

type ThemeItem = {
  slug: MenuThemeSlug;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  isPremium: boolean;
  price: number;
  layout: "grid" | "list";
  previewColors: { background: string; primary: string; accent: string };
  isOwned: boolean;
  isActive: boolean;
  purchaseStatus: ThemePurchaseStatus | null;
};

interface AppearanceManagerProps {
  activeMenuTheme: string;
  themes: ThemeItem[];
}

export function AppearanceManager({ activeMenuTheme, themes }: AppearanceManagerProps) {
  const t = useTranslations("appearance");
  const locale = useLocale();
  const router = useRouter();
  const [selecting, setSelecting] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");

  const handleSelect = async (slug: MenuThemeSlug) => {
    setSelecting(slug);
    try {
      await apiRequest("/api/menu-themes", {
        method: "PATCH",
        body: JSON.stringify({ menuTheme: slug }),
      });
      router.refresh();
      toast.success(t("themeApplied"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("selectFailed"));
    } finally {
      setSelecting(null);
    }
  };

  const handlePurchase = async (slug: MenuThemeSlug) => {
    if (!paymentReference.trim()) {
      toast.error(t("paymentRequired"));
      return;
    }

    setPurchasing(slug);
    try {
      await apiRequest("/api/menu-themes/purchase", {
        method: "POST",
        body: JSON.stringify({
          themeSlug: slug,
          paymentReference: paymentReference.trim(),
          paymentNotes: paymentNotes.trim() || undefined,
        }),
      });
      setPaymentReference("");
      setPaymentNotes("");
      router.refresh();
      toast.success(t("purchaseSubmitted"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("purchaseFailed"));
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          {t("title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {themes.map((theme) => {
          const name = locale === "ar" ? theme.nameAr : theme.nameEn;
          const description = locale === "ar" ? theme.descriptionAr : theme.descriptionEn;
          const isCurrent = activeMenuTheme === theme.slug;
          const isPending = theme.purchaseStatus === "PENDING";
          const canSelect = theme.isOwned && !isCurrent;
          const needsPurchase = theme.isPremium && !theme.isOwned && !isPending;

          return (
            <Card
              key={theme.slug}
              className={cn(
                "overflow-hidden transition-all",
                isCurrent && "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20"
              )}
            >
              <div
                className="h-28 relative"
                style={{ background: theme.previewColors.background }}
              >
                <div className="absolute inset-0 flex items-center justify-center gap-3 p-4">
                  <div
                    className="h-10 w-10 rounded-full"
                    style={{ background: theme.previewColors.primary }}
                  />
                  <div className="space-y-1.5">
                    <div
                      className="h-2 w-20 rounded-full"
                      style={{ background: theme.previewColors.accent, opacity: 0.8 }}
                    />
                    <div
                      className="h-2 w-14 rounded-full"
                      style={{ background: theme.previewColors.accent, opacity: 0.4 }}
                    />
                  </div>
                </div>
                {theme.isPremium && (
                  <Badge className="absolute top-3 end-3 gap-1 bg-amber-500/90 text-white border-0">
                    <Crown className="h-3 w-3" />
                    {t("premium")}
                  </Badge>
                )}
                {isCurrent && (
                  <Badge className="absolute top-3 start-3 gap-1" variant="default">
                    <Check className="h-3 w-3" />
                    {t("active")}
                  </Badge>
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold">{name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
                </div>

                {theme.isPremium && (
                  <p className="text-lg font-bold">
                    {formatCurrencyAmount(theme.price)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      {t("oneTime")}
                    </span>
                  </p>
                )}

                {isPending && (
                  <Badge variant="secondary" className="w-full justify-center py-1.5">
                    {t("pendingPayment")}
                  </Badge>
                )}

                {canSelect && (
                  <Button
                    className="w-full"
                    variant={isCurrent ? "secondary" : "default"}
                    disabled={selecting === theme.slug}
                    onClick={() => handleSelect(theme.slug)}
                  >
                    {selecting === theme.slug ? t("applying") : t("applyTheme")}
                  </Button>
                )}

                {needsPurchase && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      {t("purchaseToUnlock")}
                    </div>
                    <div className="space-y-2">
                      <Label>{t("paymentReference")}</Label>
                      <Input
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder={t("paymentReferencePlaceholder")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("paymentNotes")}</Label>
                      <Textarea
                        value={paymentNotes}
                        onChange={(e) => setPaymentNotes(e.target.value)}
                        placeholder={t("paymentNotesPlaceholder")}
                        rows={2}
                      />
                    </div>
                    <Button
                      className="w-full"
                      disabled={purchasing === theme.slug}
                      onClick={() => handlePurchase(theme.slug)}
                    >
                      {purchasing === theme.slug ? t("submitting") : t("purchase")}
                    </Button>
                  </div>
                )}

                {!theme.isPremium && isCurrent && (
                  <Button className="w-full" variant="secondary" disabled>
                    {t("currentTheme")}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
