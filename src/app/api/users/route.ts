import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { createUser, listUsers } from "@/features/auth/services/user-service";
import { userSchema } from "@/lib/validators";

export async function GET() {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;
  const users = await listUsers(session!.restaurantId);
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession("OWNER");
  if (error) return error;

  const body = await request.json();
  const parsed = userSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const user = await createUser({
      restaurantId: session!.restaurantId,
      ...parsed.data,
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create user" },
      { status: 400 }
    );
  }
}
