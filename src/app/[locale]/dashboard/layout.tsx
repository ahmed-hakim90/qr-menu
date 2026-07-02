import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { getEffectiveLimits, getRestaurantSubscription } from "@/lib/plans";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const subscription = await getRestaurantSubscription(session.restaurantId);
  const limits = getEffectiveLimits(subscription);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        userName={session.name}
        userRole={session.role}
        features={{ hasTables: limits.hasTables }}
      />
      <main className="lg:ps-64 min-h-screen">
        <div className="p-6 pt-16 lg:pt-6">{children}</div>
      </main>
    </div>
  );
}
