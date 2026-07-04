"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Ban,
  CheckCircle2,
  Package,
  Printer,
  QrCode,
  ScanLine,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/features/cards/card-labels";

type DashboardData = {
  counts: {
    available: number;
    assigned: number;
    inactive: number;
    lost: number;
    disabled: number;
    printed: number;
    neverUsed: number;
  };
  scans: { today: number; month: number };
  topCards: { serialNumber: string; token: string; scanCount: number }[];
  topRestaurants: { name: string; scans: number }[];
  latestAssignments: {
    assignedAt: string;
    card: { serialNumber: string; token: string };
    restaurant: { nameEn: string };
    branch: { nameEn: string };
    table: { number: number };
    assignedBy: { name: string } | null;
  }[];
};

export function CardsDashboardManager() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/admin/cards/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return <p className="text-muted-foreground p-6">Loading dashboard…</p>;
  }

  const statCards = [
    { label: "Available", value: data.counts.available, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Assigned", value: data.counts.assigned, icon: QrCode, color: "text-primary" },
    { label: "Inactive", value: data.counts.inactive, icon: Package, color: "text-muted-foreground" },
    { label: "Lost", value: data.counts.lost, icon: Ban, color: "text-destructive" },
    { label: "Disabled", value: data.counts.disabled, icon: Ban, color: "text-destructive" },
    { label: "Printed", value: data.counts.printed, icon: Printer, color: "text-blue-500" },
    { label: "Never Used", value: data.counts.neverUsed, icon: Package, color: "text-amber-500" },
    { label: "Today's Scans", value: data.scans.today, icon: ScanLine, color: "text-primary" },
    { label: "This Month", value: data.scans.month, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">QR & NFC Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Platform-wide card inventory and scan analytics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-muted ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Most Scanned Cards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topCards.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scans yet.</p>
            ) : (
              data.topCards.map((card) => (
                <div key={card.token} className="flex items-center justify-between rounded-xl border border-border/50 p-3">
                  <div>
                    <p className="font-mono text-sm">{card.serialNumber}</p>
                    <p className="text-xs text-muted-foreground">{card.token}</p>
                  </div>
                  <Badge>{card.scanCount} scans</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Scanned Restaurants</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topRestaurants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scans this month.</p>
            ) : (
              data.topRestaurants.map((r) => (
                <div key={r.name} className="flex items-center justify-between rounded-xl border border-border/50 p-3">
                  <p className="font-medium">{r.name}</p>
                  <Badge variant="secondary">{r.scans} scans</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Latest Assignments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.latestAssignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assignments yet.</p>
          ) : (
            data.latestAssignments.map((a, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-border/50 p-4">
                <div>
                  <p className="font-medium">
                    {a.card.serialNumber} → {a.restaurant.nameEn}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {a.branch.nameEn} · Table #{a.table.number}
                    {a.assignedBy ? ` · by ${a.assignedBy.name}` : ""}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(a.assignedAt)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/qr-nfc/inventory" className="text-sm text-primary hover:underline">QR Inventory →</Link>
        <Link href="/admin/qr-nfc/bulk-generator" className="text-sm text-primary hover:underline">Bulk Generator →</Link>
        <Link href="/admin/qr-nfc/assignments" className="text-sm text-primary hover:underline">Assignments →</Link>
      </div>
    </div>
  );
}
