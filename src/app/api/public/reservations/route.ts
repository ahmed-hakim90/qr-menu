import { NextRequest, NextResponse } from "next/server";
import { createPublicReservation } from "@/features/reservations/services/reservation-service";
import { reservationSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = reservationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (!parsed.data.branchSlug) {
    return NextResponse.json({ error: "branchSlug is required" }, { status: 400 });
  }

  try {
    const reservation = await createPublicReservation({
      branchSlug: parsed.data.branchSlug,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      partySize: parsed.data.partySize,
      startsAt: parsed.data.startsAt,
      notes: parsed.data.notes,
    });
    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create reservation" },
      { status: 400 }
    );
  }
}
