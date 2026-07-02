import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { updateReservationStatus } from "@/features/reservations/services/reservation-service";
import { reservationStatusSchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = reservationStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const reservation = await updateReservationStatus(
      id,
      session!.restaurantId,
      parsed.data.status
    );
    return NextResponse.json(reservation);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update reservation" },
      { status: 400 }
    );
  }
}
