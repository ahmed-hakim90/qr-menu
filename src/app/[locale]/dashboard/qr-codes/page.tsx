import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { QRGenerator } from "@/components/dashboard/qr-generator";

export default async function QRCodesPage() {
  const session = await getSession();
  if (!session) return null;

  const [branches, restaurant] = await Promise.all([
    db.branch.findMany({
      where: { restaurantId: session.restaurantId },
      select: { id: true, nameEn: true, nameAr: true, slug: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.restaurant.findUnique({
      where: { id: session.restaurantId },
      select: { nameEn: true, nameAr: true },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">QR Codes</h1>
      <QRGenerator
        branches={branches}
        restaurantName={restaurant?.nameEn ?? "QR Menu"}
        restaurantNameAr={restaurant?.nameAr ?? "قائمة الطعام"}
      />
    </div>
  );
}
