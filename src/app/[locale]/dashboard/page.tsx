import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTodayAnalytics } from "@/features/analytics/services/analytics-service";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  Package,
  FolderOpen,
  Building2,
  Tag,
  ClipboardList,
  Wallet,
  BarChart3,
  UtensilsCrossed,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getSession();
  const t = await getTranslations("dashboard");

  if (!session) return null;

  const [products, categories, branches, offers, analytics] = await Promise.all([
    db.product.count({ where: { restaurantId: session.restaurantId } }),
    db.category.count({ where: { restaurantId: session.restaurantId } }),
    db.branch.count({ where: { restaurantId: session.restaurantId } }),
    db.offer.count({ where: { restaurantId: session.restaurantId, isActive: true } }),
    getTodayAnalytics(session.restaurantId),
  ]);

  const stats = [
    { label: t("totalProducts"), value: products, icon: Package },
    { label: t("totalCategories"), value: categories, icon: FolderOpen },
    { label: t("totalBranches"), value: branches, icon: Building2 },
    { label: t("activeOffers"), value: offers, icon: Tag },
    { label: t("todaySales"), value: `${analytics.salesTotal.toFixed(2)} EGP`, icon: BarChart3 },
    { label: t("openOrders"), value: analytics.openOrdersCount, icon: ClipboardList },
    { label: t("activeTables"), value: analytics.occupiedTables, icon: UtensilsCrossed },
    { label: t("reservationsToday"), value: analytics.reservations, icon: Wallet },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">
        {t("welcome")}, {session.name}
      </h1>
      <p className="text-muted-foreground mb-8">RestaurantOS Dashboard</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/dashboard/orders">{t("orders")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/captain">{t("captain")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/cashier">{t("cashier")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/analytics">{t("analytics")}</Link>
        </Button>
      </div>
    </div>
  );
}
