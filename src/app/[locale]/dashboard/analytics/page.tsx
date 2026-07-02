import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Today&apos;s sales, tables, orders, and reservations.</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
