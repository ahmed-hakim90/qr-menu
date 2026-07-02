import { db } from "@/lib/db";
import { createNotification } from "@/features/notifications/services/notification-service";
import { publishRestaurantEvent } from "@/lib/events";
import { calculateLineTotal, calculateOrderTotals, roundMoney } from "@/lib/money";
import type { OrderStatus, Prisma } from "@/generated/prisma";

type OrderItemInput = {
  productId: string;
  quantity: number;
  notes?: string;
  sizeId?: string;
  addonIds?: string[];
};

export async function createOrder(input: {
  sessionId: string;
  items: OrderItemInput[];
  customerNote?: string;
}) {
  if (!input.items.length) {
    throw new Error("Order must include at least one item");
  }

  const session = await db.tableSession.findUnique({
    where: { id: input.sessionId },
    include: {
      table: true,
      branch: true,
    },
  });

  if (!session || session.status === "CLOSED") {
    throw new Error("Session not found");
  }

  const settings = await db.settings.findUnique({
    where: { restaurantId: session.restaurantId },
  });

  const productIds = input.items.map((item) => item.productId);
  const products = await db.product.findMany({
    where: {
      id: { in: productIds },
      restaurantId: session.restaurantId,
      isAvailable: true,
      productBranches: {
        some: { branchId: session.branchId, isAvailable: true },
      },
    },
    include: {
      productSizes: { include: { size: true } },
      productAddons: { include: { addon: true } },
    },
  });

  if (products.length !== productIds.length) {
    throw new Error("One or more products are unavailable");
  }

  const productMap = new Map(products.map((product) => [product.id, product]));
  const lineItems = input.items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    let unitPrice = product.price;
    const modifierData: Record<string, Prisma.InputJsonValue> = {};

    if (item.sizeId) {
      const productSize = product.productSizes.find((entry) => entry.sizeId === item.sizeId);
      if (!productSize) {
        throw new Error("Invalid size selection");
      }
      unitPrice = productSize.price ?? product.price + productSize.size.priceModifier;
      modifierData.size = {
        id: productSize.sizeId,
        nameAr: productSize.size.nameAr,
        nameEn: productSize.size.nameEn,
      };
    }

    if (item.addonIds?.length) {
      const addons = product.productAddons
        .filter((entry) => item.addonIds?.includes(entry.addonId))
        .map((entry) => entry.addon);
      unitPrice = roundMoney(unitPrice + addons.reduce((sum, addon) => sum + addon.price, 0));
      modifierData.addons = addons.map((addon) => ({
        id: addon.id,
        nameAr: addon.nameAr,
        nameEn: addon.nameEn,
        price: addon.price,
      }));
    }

    return {
      productId: product.id,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      quantity: item.quantity,
      unitPrice,
      total: calculateLineTotal(item.quantity, unitPrice),
      notes: item.notes,
      modifiers: Object.keys(modifierData).length ? modifierData : undefined,
    };
  });

  const totals = calculateOrderTotals(lineItems, settings?.taxRate ?? 0);

  const order = await db.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        restaurantId: session.restaurantId,
        branchId: session.branchId,
        sessionId: session.id,
        status: "NEW",
        customerNote: input.customerNote,
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        items: {
          create: lineItems,
        },
      },
      include: { items: true, session: { include: { table: true } } },
    });

    const sessionTotals = await tx.order.aggregate({
      where: {
        sessionId: session.id,
        status: { not: "CANCELLED" },
      },
      _sum: { subtotal: true, taxTotal: true, total: true },
    });

    await tx.tableSession.update({
      where: { id: session.id },
      data: {
        subtotal: roundMoney(sessionTotals._sum.subtotal ?? 0),
        taxTotal: roundMoney(sessionTotals._sum.taxTotal ?? 0),
        total: roundMoney(sessionTotals._sum.total ?? 0),
      },
    });

    return created;
  });

  await createNotification({
    restaurantId: order.restaurantId,
    branchId: order.branchId,
    sessionId: order.sessionId,
    type: "ORDER_CREATED",
    title: "New order",
    body: `${order.session.table.name} placed a new order`,
    data: { orderId: order.id },
  });

  publishRestaurantEvent({
    type: "order.created",
    restaurantId: order.restaurantId,
    branchId: order.branchId,
    payload: { orderId: order.id, sessionId: order.sessionId, status: order.status },
    at: new Date().toISOString(),
  });

  return order;
}

export async function updateOrderStatus(
  orderId: string,
  restaurantId: string,
  status: OrderStatus
) {
  const order = await db.order.findFirst({
    where: { id: orderId, restaurantId },
    include: { session: { include: { table: true } } },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const updated = await db.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: true, session: { include: { table: true } } },
  });

  await createNotification({
    restaurantId,
    branchId: order.branchId,
    sessionId: order.sessionId,
    type: "ORDER_UPDATED",
    title: "Order updated",
    body: `${order.session.table.name} order moved to ${status}`,
    data: { orderId, status },
  });

  publishRestaurantEvent({
    type: "order.updated",
    restaurantId,
    branchId: order.branchId,
    payload: { orderId, sessionId: order.sessionId, status },
    at: new Date().toISOString(),
  });

  return updated;
}

export async function listOrderBoard(restaurantId: string, branchId?: string) {
  return db.order.findMany({
    where: {
      restaurantId,
      ...(branchId ? { branchId } : {}),
      status: { in: ["NEW", "PREPARING", "READY", "DELIVERED", "WAITING_BILL", "PAID"] },
      createdAt: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
    include: {
      items: true,
      session: { include: { table: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function listCaptainOrders(restaurantId: string, branchId?: string) {
  return db.order.findMany({
    where: {
      restaurantId,
      ...(branchId ? { branchId } : {}),
      status: { in: ["NEW", "PREPARING", "READY", "DELIVERED"] },
    },
    include: {
      items: true,
      session: { include: { table: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}
