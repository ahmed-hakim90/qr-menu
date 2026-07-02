import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { createReservation, listReservations } from "@/features/reservations/services/reservation-service";
import { reservationSchema } from "@/lib/validators";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const branchId = request.nextUrl.searchParams.get("branchId") || undefined;
  const reservations = await listReservations(session!.restaurantId, branchId);
  return NextResponse.json(reservations);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const body = await request.json();
  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const branchId = parsed.data.branchId;
  if (!branchId) {
    return NextResponse.json({ error: "branchId is required" }, { status: 400 });
  }

  const branch = await db.branch.findFirst({
    where: { id: branchId, restaurantId: session!.restaurantId },
  });
  if (!branch) {
    return NextResponse.json({ error: "Branch not found" }, { status: 404 });
  }

  const reservation = await createReservation({
    restaurantId: session!.restaurantId,
    branchId,
    tableId: parsed.data.tableId,
    customerName: parsed.data.customerName,
    customerPhone: parsed.data.customerPhone,
    partySize: parsed.data.partySize,
    startsAt: parsed.data.startsAt,
    notes: parsed.data.notes,
  });

  return NextResponse.json(reservation, { status: 201 });
}
