import { db } from "@/lib/db";
import { ThemePurchasesManager } from "@/components/admin/theme-purchases-manager";

export default async function AdminThemePurchasesPage() {
  const purchases = await db.themePurchase.findMany({
    orderBy: { updatedAt: "desc" },
    include: { restaurant: true },
  });

  purchases.sort((a, b) => {
    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
    if (b.status === "PENDING" && a.status !== "PENDING") return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });

  return <ThemePurchasesManager purchases={purchases} />;
}
