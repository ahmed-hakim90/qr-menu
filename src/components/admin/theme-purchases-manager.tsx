"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatCurrencyAmount } from "@/lib/currency";
import { getMenuTheme } from "@/lib/menu-themes";
import type { Restaurant, ThemePurchase, ThemePurchaseStatus } from "@/generated/prisma";

type ThemePurchaseRow = ThemePurchase & {
  restaurant: Restaurant;
};

interface ThemePurchasesManagerProps {
  purchases: ThemePurchaseRow[];
}

const STATUSES: ThemePurchaseStatus[] = ["ACTIVE", "PENDING"];

function statusVariant(status: ThemePurchaseStatus) {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "PENDING":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString();
}

export function ThemePurchasesManager({ purchases }: ThemePurchasesManagerProps) {
  const router = useRouter();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ThemePurchaseStatus>>(
    Object.fromEntries(purchases.map((item) => [item.id, item.status]))
  );

  const patch = async (id: string, body: Record<string, unknown>, message: string) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/theme-purchases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed");
      }
      router.refresh();
      toast.success(message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Theme Purchases</h1>
        <p className="text-sm text-muted-foreground">
          Review premium menu theme payment requests and activate purchased themes.
        </p>
      </div>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No theme purchase requests yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {purchases.map((item) => {
            const draftStatus = drafts[item.id];
            const theme = getMenuTheme(item.themeSlug);
            const isDirty = draftStatus !== item.status;

            return (
              <Card key={item.id}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-lg">{item.restaurant.nameEn}</h3>
                        <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.restaurant.nameAr}</p>
                      <p className="text-sm mt-3">
                        Theme: <span className="font-medium">{theme.nameEn}</span>{" "}
                        <span className="text-muted-foreground">({theme.nameAr})</span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Amount: {formatCurrencyAmount(item.pricePaid)} · Requested:{" "}
                        {formatDate(item.createdAt)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Reference: {item.paymentReference || "—"}
                      </p>
                      {item.paymentNotes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Notes: {item.paymentNotes}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 lg:w-48">
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={draftStatus}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [item.id]: e.target.value as ThemePurchaseStatus,
                          }))
                        }
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
                    <Button
                      size="sm"
                      disabled={!isDirty || savingId === item.id}
                      onClick={() =>
                        patch(item.id, { status: draftStatus }, "Theme purchase updated")
                      }
                    >
                      Save Changes
                    </Button>
                    {item.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={savingId === item.id}
                        onClick={() =>
                          patch(
                            item.id,
                            { status: "ACTIVE", activateTheme: true },
                            "Theme purchase approved"
                          )
                        }
                      >
                        Approve & Apply Theme
                      </Button>
                    )}
                    {item.status === "ACTIVE" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={savingId === item.id}
                        onClick={() =>
                          patch(item.id, { status: "PENDING" }, "Theme purchase marked pending")
                        }
                      >
                        Mark Pending
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
