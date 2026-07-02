import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AddonsManager } from "@/components/dashboard/addons-manager";

export default async function AddonsPage() {
  const session = await getSession();
  if (!session) return null;

  const [addons, settings] = await Promise.all([
    db.addon.findMany({
      where: { restaurantId: session.restaurantId },
      orderBy: { sortOrder: "asc" },
    }),
    db.settings.findUnique({
      where: { restaurantId: session.restaurantId },
    }),
  ]);

  return (
    <AddonsManager addons={addons} currencySymbol={settings?.currencySymbol} />
  );
}
