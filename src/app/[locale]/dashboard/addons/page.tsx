import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

export default async function AddonsPage() {
  const session = await getSession();
  if (!session) return null;

  const addons = await db.addon.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add-ons</h1>
      <div className="grid gap-3">
        {addons.map((addon) => (
          <Card key={addon.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium">{addon.nameEn}</h3>
                <p className="text-sm text-muted-foreground">{addon.nameAr}</p>
              </div>
              <span className="font-semibold text-primary">+{formatPrice(addon.price)}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
