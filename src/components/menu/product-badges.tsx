import type { Product } from "@/generated/prisma";
import { Badge } from "@/components/ui/badge";

type ProductWithBadges = Pick<
  Product,
  | "isBestSeller"
  | "isNew"
  | "isOffer"
  | "isSpicy"
  | "isVegetarian"
  | "isVegan"
>;

interface ProductBadgesProps {
  product: ProductWithBadges;
  labels: {
    bestSeller: string;
    new: string;
    offer: string;
    spicy: string;
    vegetarian: string;
    vegan: string;
  };
}

export function ProductBadges({ product, labels }: ProductBadgesProps) {
  const badges = [
    { show: product.isBestSeller, label: labels.bestSeller, variant: "warning" as const },
    { show: product.isNew, label: labels.new, variant: "success" as const },
    { show: product.isOffer, label: labels.offer, variant: "destructive" as const },
    { show: product.isSpicy, label: labels.spicy, variant: "destructive" as const },
    { show: product.isVegetarian, label: labels.vegetarian, variant: "success" as const },
    { show: product.isVegan, label: labels.vegan, variant: "success" as const },
  ].filter((b) => b.show);

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <Badge key={badge.label} variant={badge.variant}>
          {badge.label}
        </Badge>
      ))}
    </div>
  );
}
