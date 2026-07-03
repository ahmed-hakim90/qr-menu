import { redirect } from "next/navigation";
import { getPlatformSession } from "@/lib/platform-auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { countPendingSubscriptionPayments } from "@/features/billing/services/billing-service";
import { countPendingThemePurchases } from "@/features/themes/services/theme-service";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getPlatformSession();
  if (!session) redirect("/admin/login");

  const [pendingPayments, pendingThemePurchases] = await Promise.all([
    countPendingSubscriptionPayments(),
    countPendingThemePurchases(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        adminName={session.name}
        pendingPayments={pendingPayments}
        pendingThemePurchases={pendingThemePurchases}
      />
      <main className="lg:ps-64 min-h-screen">
        <div className="p-6 pt-16 lg:pt-6">{children}</div>
      </main>
    </div>
  );
}
