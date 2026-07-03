import { db } from "@/lib/db";
import { createNotification } from "@/features/notifications/services/notification-service";
import { publishRestaurantEvent } from "@/lib/events";
import type { ReservationStatus } from "@/generated/prisma";

export async function listReservations(restaurantId: string, branchId?: string) {
  return db.reservation.findMany({
    where: {
      restaurantId,
      ...(branchId ? { branchId } : {}),
      startsAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    },
    include: { table: true, branch: true },
    orderBy: { startsAt: "asc" },
  });
}

export async function createReservation(input: {
  restaurantId: string;
  branchId: string;
  tableId?: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  startsAt: Date;
  notes?: string;
  status?: ReservationStatus;
}) {
  const status = input.status ?? "CONFIRMED";

  const reservation = await db.$transaction(async (tx) => {
    const created = await tx.reservation.create({
      data: {
        restaurantId: input.restaurantId,
        branchId: input.branchId,
        tableId: input.tableId,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        partySize: input.partySize,
        startsAt: input.startsAt,
        notes: input.notes,
        status,
      },
      include: { table: true, branch: true },
    });

    if (input.tableId) {
      await tx.diningTable.update({
        where: { id: input.tableId },
        data: { status: "RESERVED" },
      });
    }

    return created;
  });

  await createNotification({
    restaurantId: input.restaurantId,
    branchId: input.branchId,
    type: "RESERVATION_CREATED",
    title: "Reservation created",
    body: `${reservation.customerName} reserved for ${reservation.partySize}`,
    data: { reservationId: reservation.id },
  });

  publishRestaurantEvent({
    type: "reservation.created",
    restaurantId: input.restaurantId,
    branchId: input.branchId,
    payload: { reservationId: reservation.id },
    at: new Date().toISOString(),
  });

  return reservation;
}

export async function updateReservationStatus(
  reservationId: string,
  restaurantId: string,
  status: ReservationStatus
) {
  const reservation = await db.reservation.findFirst({
    where: { id: reservationId, restaurantId },
  });

  if (!reservation) {
    throw new Error("Reservation not found");
  }

  return db.$transaction(async (tx) => {
    const updated = await tx.reservation.update({
      where: { id: reservationId },
      data: { status },
      include: { table: true, branch: true },
    });

    if (reservation.tableId) {
      if (status === "CANCELLED" || status === "NO_SHOW") {
        await tx.diningTable.update({
          where: { id: reservation.tableId },
          data: { status: "AVAILABLE" },
        });
      } else if (status === "SEATED") {
        await tx.diningTable.update({
          where: { id: reservation.tableId },
          data: { status: "OCCUPIED" },
        });
      }
    }

    return updated;
  });
}

export async function createPublicReservation(input: {
  branchSlug: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  startsAt: Date;
  notes?: string;
}) {
  const branch = await db.branch.findFirst({
    where: { slug: input.branchSlug, isActive: true },
  });

  if (!branch) {
    throw new Error("Branch not found");
  }

  return createReservation({
    restaurantId: branch.restaurantId,
    branchId: branch.id,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    partySize: input.partySize,
    startsAt: input.startsAt,
    notes: input.notes,
    status: "PENDING",
  });
}
