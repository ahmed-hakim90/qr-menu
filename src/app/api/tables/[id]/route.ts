import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { assertPlanFeature } from "@/lib/plans";
import { diningTableSchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function findTable(id: string, restaurantId: string) {
  return db.diningTable.findFirst({
    where: { id, restaurantId },
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  try {
    await assertPlanFeature(session!.restaurantId, "tables");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Plan feature unavailable" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const existing = await findTable(id, session!.restaurantId);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = diningTableSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.branchId) {
    const branch = await db.branch.findFirst({
      where: { id: parsed.data.branchId, restaurantId: session!.restaurantId },
      select: { id: true },
    });
    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }
  }

  try {
    const table = await db.diningTable.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(table);
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "A table with this number already exists in this branch" },
        { status: 409 }
      );
    }
    throw err;
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  try {
    await assertPlanFeature(session!.restaurantId, "tables");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Plan feature unavailable" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const existing = await findTable(id, session!.restaurantId);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.diningTable.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
