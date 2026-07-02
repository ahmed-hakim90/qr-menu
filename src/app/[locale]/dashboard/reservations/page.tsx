import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReservationsManager } from "@/components/reservations/reservations-manager";

export default async function ReservationsPage() {
  const session = await getSession();
  if (!session) return null;

  const [branches, tables] = await Promise.all([
    db.branch.findMany({
      where: { restaurantId: session.restaurantId },
      select: { id: true, nameEn: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.diningTable.findMany({
      where: { restaurantId: session.restaurantId, isActive: true },
      select: { id: true, name: true },
      orderBy: { number: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reservations</h1>
        <p className="text-sm text-muted-foreground">Manage simple table reservations.</p>
      </div>
      <ReservationsManager branches={branches} tables={tables} />
    </div>
  );
}
