"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/dashboard-api";
import { formatCurrencyAmount } from "@/lib/currency";
import { getPlanFeatureLabels, isMenuOnlyPlan } from "@/lib/plan-features";
import type { Plan, Subscription, SubscriptionStatus } from "@/generated/prisma";

interface BillingManagerProps {
  subscription: (Subscription & { plan: Plan }) | null;
  plans: Plan[];
  usage: { branches: number; products: number; users: number };
}

function statusLabel(status: SubscriptionStatus) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "PENDING":
      return "Pending Payment";
    case "TRIAL":
      return "Trial";
    case "EXPIRED":
      return "Expired";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const percent = Math.min(100, Math.round((used / max) * 100));
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">{used} / {max}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function BillingManager({ subscription, plans, usage }: BillingManagerProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(subscription?.plan.slug || "free");
  const [paymentReference, setPaymentReference] = useState(subscription?.paymentReference || "");
  const [paymentNotes, setPaymentNotes] = useState(subscription?.paymentNotes || "");
  const [saving, setSaving] = useState(false);

  const currentPlan = subscription?.plan || plans[0];

  const handleSubscribe = async () => {
    setSaving(true);
    try {
      await apiRequest("/api/billing", {
        method: "POST",
        body: JSON.stringify({
          planSlug: selectedPlan,
          paymentReference,
          paymentNotes,
        }),
      });
      router.refresh();
      toast.success("Plan request submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update plan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Plans</h1>
        <p className="text-sm text-muted-foreground">Manual monthly billing. Upgrade and send your payment reference.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold">{currentPlan?.nameEn}</h3>
            <Badge>{statusLabel(subscription?.status || "TRIAL")}</Badge>
            <span className="text-muted-foreground">
              {currentPlan?.priceMonthly === 0 ? "Free" : `${formatCurrencyAmount(currentPlan?.priceMonthly || 0)} / month`}
            </span>
          </div>
          {subscription?.status === "PENDING" && (
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Your upgrade request is pending. We will activate it after manual payment confirmation.
            </p>
          )}
          <div className="grid gap-4">
            <UsageBar label="Branches" used={usage.branches} max={currentPlan?.maxBranches || 1} />
            <UsageBar label="Products" used={usage.products} max={currentPlan?.maxProducts || 30} />
            <UsageBar label="Users" used={usage.users} max={currentPlan?.maxUsers || 2} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Payment Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Choose a paid plan below.</p>
          <p>2. Transfer the monthly amount via bank transfer or agreed payment method.</p>
          <p>3. Enter your payment reference and submit the request.</p>
          <p>4. Your plan will be activated manually within 24 hours.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = subscription?.planId === plan.id;
          const isSelected = selectedPlan === plan.slug;
          return (
            <Card
              key={plan.id}
              className={isSelected ? "border-primary shadow-lg shadow-primary/10" : ""}
            >
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{plan.nameEn}</h3>
                  <p className="text-sm text-muted-foreground">{plan.nameAr}</p>
                </div>
                <p className="text-3xl font-bold">
                  {plan.priceMonthly === 0 ? "Free" : formatCurrencyAmount(plan.priceMonthly)}
                  {plan.priceMonthly > 0 && <span className="text-sm font-normal text-muted-foreground"> / month</span>}
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    {isMenuOnlyPlan(plan) ? "Digital menu only" : getPlanFeatureLabels(plan).en}
                  </li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{plan.maxBranches} branches</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{plan.maxProducts} products</li>
                  <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{plan.maxUsers} users</li>
                  {plan.customDomain && (
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />Custom domain</li>
                  )}
                </ul>
                <Button
                  variant={isSelected ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setSelectedPlan(plan.slug)}
                >
                  {isCurrent ? "Current Plan" : "Select Plan"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPlan !== "free" && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Reference</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Reference</Label>
              <Input
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Bank transfer reference or receipt number"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Any payment details or contact info"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleSubscribe} disabled={saving}>
        {saving ? "Submitting..." : "Submit Plan Request"}
      </Button>
    </div>
  );
}
