import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CreditCard, Package, Palette, Store } from "lucide-react";

export default async function AdminOverviewPage() {
  const [
    restaurants,
    pendingSubscriptions,
    pendingThemePurchases,
    activeSubscriptions,
    totalProducts,
    totalBranches,
    recentPending,
    recentThemePurchases,
  ] = await Promise.all([
    db.restaurant.count(),
    db.subscription.count({ where: { status: "PENDING" } }),
    db.themePurchase.count({ where: { status: "PENDING" } }),
    db.subscription.count({ where: { status: { in: ["ACTIVE", "TRIAL"] } } }),
    db.product.count(),
    db.branch.count(),
    db.subscription.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { plan: true, restaurant: true },
    }),
    db.themePurchase.findMany({
      where: { status: "PENDING" },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { restaurant: true },
    }),
  ]);

  const stats = [
    { label: "Restaurants", value: restaurants, icon: Building2 },
    { label: "Pending Payments", value: pendingSubscriptions, icon: CreditCard },
    { label: "Pending Theme Purchases", value: pendingThemePurchases, icon: Palette },
    { label: "Active Subscriptions", value: activeSubscriptions, icon: Store },
    { label: "Total Products", value: totalProducts, icon: Package },
    { label: "Total Branches", value: totalBranches, icon: Building2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-sm text-muted-foreground">Manage tenants and manual billing approvals.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Payment Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentPending.length === 0 && recentThemePurchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending requests.</p>
          ) : (
            <>
              {recentPending.map((item) => (
                <Link
                  key={item.id}
                  href="/admin/subscriptions"
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/50 p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{item.restaurant.nameEn}</p>
                    <p className="text-sm text-muted-foreground">
                      Subscription: {item.plan.nameEn} · {item.paymentReference || "No reference"}
                    </p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </Link>
              ))}
              {recentThemePurchases.map((item) => (
                <Link
                  key={item.id}
                  href="/admin/theme-purchases"
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/50 p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{item.restaurant.nameEn}</p>
                    <p className="text-sm text-muted-foreground">
                      Theme: {item.themeSlug} · {item.paymentReference || "No reference"}
                    </p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </Link>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
