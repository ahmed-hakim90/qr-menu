import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default async function CategoriesPage() {
  const session = await getSession();
  if (!session) return null;

  const categories = await db.category.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>
      <div className="grid gap-3">
        {categories.map((cat, i) => (
          <Card key={cat.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground text-sm w-8">{i + 1}</span>
                <div>
                  <h3 className="font-medium">{cat.nameEn}</h3>
                  <p className="text-sm text-muted-foreground">{cat.nameAr}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {cat._count.products} products
                </span>
                <Badge variant={cat.isVisible ? "success" : "secondary"}>
                  {cat.isVisible ? "Visible" : "Hidden"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
