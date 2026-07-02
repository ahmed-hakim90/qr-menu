import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { deleteFloor, updateFloor } from "@/features/floor/services/floor-service";
import { floorLayoutSchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = floorLayoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const floor = await updateFloor(id, session!.restaurantId, parsed.data);
    return NextResponse.json(floor);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update floor" },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const { id } = await params;
  try {
    await deleteFloor(id, session!.restaurantId);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete floor" },
      { status: 400 }
    );
  }
}
