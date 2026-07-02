import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { createFloor, listFloors } from "@/features/floor/services/floor-service";
import { floorSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const branchId = request.nextUrl.searchParams.get("branchId") || undefined;
  const floors = await listFloors(session!.restaurantId, branchId);
  return NextResponse.json(floors);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const body = await request.json();
  const parsed = floorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const floor = await createFloor({
    restaurantId: session!.restaurantId,
    ...parsed.data,
  });
  return NextResponse.json(floor, { status: 201 });
}
