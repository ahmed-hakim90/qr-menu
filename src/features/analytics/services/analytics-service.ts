import { db } from "@/lib/db";

export async function getTodayAnalytics(restaurantId: string, branchId?: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const where = {
    restaurantId,
    ...(branchId ? { branchId } : {}),
    createdAt: { gte: start },
  };

  const [orders, paidPayments, activeSessions, reservations, occupiedTables] =
    await Promise.all([
      db.order.findMany({
        where,
        select: { total: true, status: true },
      }),
      db.payment.findMany({
        where: {
          restaurantId,
          ...(branchId ? { branchId } : {}),
          status: "PAID",
          paidAt: { gte: start },
        },
        select: { amount: true, provider: true },
      }),
      db.tableSession.count({
        where: {
          restaurantId,
          ...(branchId ? { branchId } : {}),
          status: { in: ["OPEN", "WAITING_BILL"] },
        },
      }),
      db.reservation.count({
        where: {
          restaurantId,
          ...(branchId ? { branchId } : {}),
          startsAt: { gte: start },
          status: { in: ["PENDING", "CONFIRMED", "SEATED"] },
        },
      }),
      db.diningTable.count({
        where: {
          restaurantId,
          ...(branchId ? { branchId } : {}),
          status: { in: ["OCCUPIED", "WAITING_BILL"] },
        },
      }),
    ]);

  const salesTotal = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const cashTotal = paidPayments
    .filter((payment) => payment.provider === "CASH")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const paymobTotal = paidPayments
    .filter((payment) => payment.provider === "PAYMOB")
    .reduce((sum, payment) => sum + payment.amount, 0);

  return {
    salesTotal,
    cashTotal,
    paymobTotal,
    ordersCount: orders.length,
    openOrdersCount: orders.filter((order) =>
      ["NEW", "PREPARING", "READY", "DELIVERED", "WAITING_BILL"].includes(order.status)
    ).length,
    activeSessions,
    reservations,
    occupiedTables,
  };
}
