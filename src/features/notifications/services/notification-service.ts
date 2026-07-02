import { db } from "@/lib/db";
import { publishRestaurantEvent } from "@/lib/events";
import type { NotificationType, Prisma } from "@/generated/prisma";

type CreateNotificationInput = {
  restaurantId: string;
  branchId?: string;
  sessionId?: string;
  userId?: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
};

export async function createNotification(input: CreateNotificationInput) {
  const notification = await db.notification.create({
    data: {
      restaurantId: input.restaurantId,
      branchId: input.branchId,
      sessionId: input.sessionId,
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data,
    },
  });

  publishRestaurantEvent({
    type: "notification.created",
    restaurantId: input.restaurantId,
    branchId: input.branchId,
    payload: {
      notificationId: notification.id,
      notificationType: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data,
    },
    at: new Date().toISOString(),
  });

  return notification;
}

export async function listNotifications(restaurantId: string, limit = 30) {
  return db.notification.findMany({
    where: { restaurantId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markNotificationRead(id: string, restaurantId: string) {
  return db.notification.updateMany({
    where: { id, restaurantId, readAt: null },
    data: { readAt: new Date() },
  });
}
