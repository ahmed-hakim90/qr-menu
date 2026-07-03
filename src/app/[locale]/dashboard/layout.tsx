import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { ShareMenuLink } from "@/components/dashboard/share-menu-link";
import { getEffectiveLimits, getRestaurantSubscription } from "@/lib/plans";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [subscription, branches, restaurant] = await Promise.all([
    getRestaurantSubscription(session.restaurantId),
    db.branch.findMany({
      where: { restaurantId: session.restaurantId, isActive: true },
      select: { slug: true, nameEn: true, nameAr: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.restaurant.findUnique({
      where: { id: session.restaurantId },
      select: { subdomain: true, customDomain: true, slug: true },
    }),
  ]);
  const limits = getEffectiveLimits(subscription);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        userName={session.name}
        userRole={session.role}
        features={{ hasTables: limits.hasTables }}
      />
      <main className="lg:ps-64 min-h-screen">
        <div className="p-6 pt-16 lg:pt-6">
          <ShareMenuLink
            branches={branches}
            subdomain={restaurant?.subdomain || restaurant?.slug}
            customDomain={restaurant?.customDomain}
          />
          {children}
        </div>
      </main>
    </div>
  );
}
