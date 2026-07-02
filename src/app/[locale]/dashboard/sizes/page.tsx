import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";

export default async function SizesPage() {
  const session = await getSession();
  if (!session) return null;

  const sizes = await db.size.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sizes</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        {sizes.map((size) => (
          <Card key={size.id}>
            <CardContent className="p-4 text-center">
              <h3 className="font-medium">{size.nameEn}</h3>
              <p className="text-sm text-muted-foreground">{size.nameAr}</p>
              {size.priceModifier > 0 && (
                <p className="text-primary font-semibold mt-1">+{size.priceModifier} SAR</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
