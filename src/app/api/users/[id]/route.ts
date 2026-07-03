import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { deleteUser, updateUser } from "@/features/auth/services/user-service";
import { userUpdateSchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("OWNER");
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const user = await updateUser(id, session!.restaurantId, parsed.data);
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update user" },
      { status: 400 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("OWNER");
  if (error) return error;

  const { id } = await params;

  try {
    await deleteUser(id, session!.restaurantId, session!.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete user" },
      { status: 400 }
    );
  }
}
