import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default async function ProductsPage() {
  const session = await getSession();
  if (!session) return null;

  const products = await db.product.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { sortOrder: "asc" },
    include: { category: true },
    take: 50,
  });

  const total = await db.product.count({
    where: { restaurantId: session.restaurantId },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{total} total products</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>
      <div className="grid gap-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                {product.image ? (
                  <Image src={product.image} alt={product.nameEn} fill className="object-cover" sizes="56px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl">🍽️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{product.nameEn}</h3>
                <p className="text-sm text-muted-foreground truncate">{product.category.nameEn}</p>
              </div>
              <div className="text-end shrink-0">
                <p className="font-semibold text-primary">{formatPrice(product.price)}</p>
                <div className="flex gap-1 mt-1 justify-end">
                  {product.isBestSeller && <Badge variant="warning" className="text-[10px]">Best</Badge>}
                  {product.isNew && <Badge variant="success" className="text-[10px]">New</Badge>}
                  {!product.isAvailable && <Badge variant="secondary" className="text-[10px]">Unavailable</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
