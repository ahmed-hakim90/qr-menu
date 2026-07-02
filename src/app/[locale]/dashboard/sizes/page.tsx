import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SizesManager } from "@/components/dashboard/sizes-manager";

export default async function SizesPage() {
  const session = await getSession();
  if (!session) return null;

  const sizes = await db.size.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { sortOrder: "asc" },
  });

  return <SizesManager sizes={sizes} />;
}
