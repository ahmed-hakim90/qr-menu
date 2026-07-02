"use client";

import { useEffect, useState } from "react";
import { Building2, CalendarDays, CreditCard, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/dashboard-api";

type Analytics = {
  salesTotal: number;
  cashTotal: number;
  paymobTotal: number;
  ordersCount: number;
  openOrdersCount: number;
  activeSessions: number;
  reservations: number;
  occupiedTables: number;
};

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    apiRequest<Analytics>("/api/analytics")
      .then(setAnalytics)
      .catch(() => setAnalytics(null));
  }, []);

  if (!analytics) {
    return <p className="text-sm text-muted-foreground">Loading analytics...</p>;
  }

  const cards = [
    { label: "Today's Sales", value: `${analytics.salesTotal.toFixed(2)} EGP`, icon: CreditCard },
    { label: "Orders", value: analytics.ordersCount, icon: ShoppingBag },
    { label: "Open Orders", value: analytics.openOrdersCount, icon: ShoppingBag },
    { label: "Active Tables", value: analytics.occupiedTables, icon: UtensilsCrossed },
    { label: "Active Sessions", value: analytics.activeSessions, icon: Building2 },
    { label: "Reservations", value: analytics.reservations, icon: CalendarDays },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Cash</p>
            <p className="text-xl font-semibold">{analytics.cashTotal.toFixed(2)} EGP</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Paymob</p>
            <p className="text-xl font-semibold">{analytics.paymobTotal.toFixed(2)} EGP</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
