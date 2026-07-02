"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrencyAmount } from "@/lib/currency";
import type { Plan, Restaurant, Subscription, SubscriptionStatus } from "@/generated/prisma";

type RestaurantCounts = {
  branches: number;
  products: number;
  users: number;
};

type SubscriptionRow = Subscription & {
  plan: Plan;
  restaurant: Restaurant & { _count: RestaurantCounts };
};

interface SubscriptionsManagerProps {
  subscriptions: SubscriptionRow[];
  plans: Plan[];
}

const STATUSES: SubscriptionStatus[] = ["ACTIVE", "PENDING", "TRIAL", "EXPIRED", "CANCELLED"];

function statusVariant(status: SubscriptionStatus) {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "PENDING":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

function formatDate(value: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function SubscriptionsManager({ subscriptions, plans }: SubscriptionsManagerProps) {
  const router = useRouter();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, { planId: string; status: SubscriptionStatus }>>(
    Object.fromEntries(
      subscriptions.map((item) => [item.id, { planId: item.planId, status: item.status }])
    )
  );

  const setDraft = (id: string, patch: Partial<{ planId: string; status: SubscriptionStatus }>) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const patch = async (id: string, body: Record<string, unknown>, message: string) => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
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
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">
          Full control over every tenant plan, status, and billing period.
        </p>
      </div>

      <div className="grid gap-4">
        {subscriptions.map((item) => {
          const draft = drafts[item.id];
          const isDirty = draft.planId !== item.planId || draft.status !== item.status;
          return (
            <Card key={item.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{item.restaurant.nameEn}</h3>
                      <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.restaurant.nameAr}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {item.restaurant._count.branches} branches · {item.restaurant._count.products} products ·{" "}
                      <span className="font-medium text-foreground">{item.restaurant._count.users} users</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Period: {formatDate(item.currentPeriodStart)} → {formatDate(item.currentPeriodEnd)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Reference: {item.paymentReference || "—"}
                    </p>
                    {item.paymentNotes && (
                      <p className="text-sm text-muted-foreground mt-1">Notes: {item.paymentNotes}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:w-[420px]">
                    <div className="space-y-1">
                      <Label className="text-xs">Plan</Label>
                      <Select
                        value={draft.planId}
                        onChange={(e) => setDraft(item.id, { planId: e.target.value })}
                      >
                        {plans.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.nameEn} ({plan.priceMonthly === 0 ? "Free" : formatCurrencyAmount(plan.priceMonthly)})
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={draft.status}
                        onChange={(e) => setDraft(item.id, { status: e.target.value as SubscriptionStatus })}
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
                  <Button
                    size="sm"
                    disabled={!isDirty || savingId === item.id}
                    onClick={() => patch(item.id, { planId: draft.planId, status: draft.status }, "Subscription updated")}
                  >
                    Save Changes
                  </Button>
                  {item.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingId === item.id}
                      onClick={() => patch(item.id, { status: "ACTIVE" }, "Approved")}
                    >
                      Approve Payment
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={savingId === item.id}
                    onClick={() => patch(item.id, { extendDays: 30 }, "Extended 30 days")}
                  >
                    +30 days
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={savingId === item.id}
                    onClick={() => patch(item.id, { status: "CANCELLED" }, "Cancelled")}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
