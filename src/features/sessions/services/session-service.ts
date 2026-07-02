import { db } from "@/lib/db";
import { createNotification } from "@/features/notifications/services/notification-service";
import { publishRestaurantEvent } from "@/lib/events";
import { roundMoney } from "@/lib/money";
import type { TableSessionStatus } from "@/generated/prisma";

async function recalculateSessionTotals(sessionId: string) {
  const orders = await db.order.findMany({
    where: {
      sessionId,
      status: { not: "CANCELLED" },
    },
  });

  const subtotal = roundMoney(orders.reduce((sum, order) => sum + order.subtotal, 0));
  const taxTotal = roundMoney(orders.reduce((sum, order) => sum + order.taxTotal, 0));
  const total = roundMoney(subtotal + taxTotal);

  return db.tableSession.update({
    where: { id: sessionId },
    data: { subtotal, taxTotal, total },
  });
}

export async function openOrResumeSession(input: {
  branchSlug: string;
  tableNumber: number;
  guestName?: string;
  guestPhone?: string;
  guestCount?: number;
}) {
  const branch = await db.branch.findFirst({
    where: { slug: input.branchSlug, isActive: true },
  });

  if (!branch) {
    throw new Error("Branch not found");
  }

  const table = await db.diningTable.findFirst({
    where: {
      branchId: branch.id,
      number: input.tableNumber,
      isActive: true,
    },
  });

  if (!table) {
    throw new Error("Table not found");
  }

  const existing = await db.tableSession.findFirst({
    where: {
      tableId: table.id,
      status: { in: ["OPEN", "WAITING_BILL"] },
    },
    orderBy: { openedAt: "desc" },
    include: {
      table: true,
      orders: {
        include: { items: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (existing) {
    return existing;
  }

  return db.$transaction(async (tx) => {
    const session = await tx.tableSession.create({
      data: {
        restaurantId: branch.restaurantId,
        branchId: branch.id,
        tableId: table.id,
        guestName: input.guestName,
        guestPhone: input.guestPhone,
        guestCount: input.guestCount,
        status: "OPEN",
      },
      include: {
        table: true,
        orders: { include: { items: true } },
      },
    });

    await tx.diningTable.update({
      where: { id: table.id },
      data: { status: "OCCUPIED" },
    });

    publishRestaurantEvent({
      type: "session.opened",
      restaurantId: branch.restaurantId,
      branchId: branch.id,
      payload: { sessionId: session.id, tableId: table.id },
      at: new Date().toISOString(),
    });

    return session;
  });
}

export async function getSessionById(sessionId: string) {
  return db.tableSession.findUnique({
    where: { id: sessionId },
    include: {
      table: true,
      orders: {
        include: { items: true },
        orderBy: { createdAt: "desc" },
      },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function requestBill(sessionId: string) {
  const session = await db.tableSession.findUnique({
    where: { id: sessionId },
    include: { table: true },
  });

  if (!session || session.status === "CLOSED") {
    throw new Error("Session not found");
  }

  const updated = await db.$transaction(async (tx) => {
    const next = await tx.tableSession.update({
      where: { id: sessionId },
      data: {
        status: "WAITING_BILL",
        billRequestedAt: new Date(),
      },
      include: {
        table: true,
        orders: { include: { items: true } },
      },
    });

    await tx.diningTable.update({
      where: { id: session.tableId },
      data: { status: "WAITING_BILL" },
    });

    await tx.order.updateMany({
      where: {
        sessionId,
        status: { in: ["NEW", "PREPARING", "READY", "DELIVERED"] },
      },
      data: { status: "WAITING_BILL" },
    });

    return next;
  });

  await createNotification({
    restaurantId: session.restaurantId,
    branchId: session.branchId,
    sessionId,
    type: "BILL_REQUESTED",
    title: "Bill requested",
    body: `${session.table.name} requested the bill`,
    data: { tableId: session.tableId },
  });

  publishRestaurantEvent({
    type: "session.bill_requested",
    restaurantId: session.restaurantId,
    branchId: session.branchId,
    payload: { sessionId },
    at: new Date().toISOString(),
  });

  return updated;
}

export async function callWaiter(sessionId: string) {
  const session = await db.tableSession.findUnique({
    where: { id: sessionId },
    include: { table: true },
  });

  if (!session || session.status === "CLOSED") {
    throw new Error("Session not found");
  }

  await createNotification({
    restaurantId: session.restaurantId,
    branchId: session.branchId,
    sessionId,
    type: "WAITER_CALLED",
    title: "Waiter called",
    body: `${session.table.name} needs assistance`,
    data: { tableId: session.tableId },
  });

  publishRestaurantEvent({
    type: "session.waiter_called",
    restaurantId: session.restaurantId,
    branchId: session.branchId,
    payload: { sessionId },
    at: new Date().toISOString(),
  });

  return { success: true };
}

export async function closeSession(sessionId: string, status: TableSessionStatus = "CLOSED") {
  const session = await db.tableSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  const updated = await db.$transaction(async (tx) => {
    const next = await tx.tableSession.update({
      where: { id: sessionId },
      data: {
        status,
        closedAt: new Date(),
      },
      include: {
        table: true,
        orders: { include: { items: true } },
        payments: true,
      },
    });

    await tx.diningTable.update({
      where: { id: session.tableId },
      data: { status: "AVAILABLE" },
    });

    await tx.order.updateMany({
      where: { sessionId, status: { not: "CANCELLED" } },
      data: { status: "PAID" },
    });

    return next;
  });

  await recalculateSessionTotals(sessionId);

  publishRestaurantEvent({
    type: "session.closed",
    restaurantId: session.restaurantId,
    branchId: session.branchId,
    payload: { sessionId },
    at: new Date().toISOString(),
  });

  return updated;
}

export async function listActiveSessions(restaurantId: string, branchId?: string) {
  return db.tableSession.findMany({
    where: {
      restaurantId,
      ...(branchId ? { branchId } : {}),
      status: { in: ["OPEN", "WAITING_BILL"] },
    },
    include: {
      table: true,
      orders: true,
    },
    orderBy: { openedAt: "desc" },
  });
}
