import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { assertPlanFeature } from "@/lib/plans";
import { diningTableSchema } from "@/lib/validators";

async function ensureBranch(restaurantId: string, branchId: string) {
  return db.branch.findFirst({
    where: { id: branchId, restaurantId },
    select: { id: true },
  });
}

export async function GET(request: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  try {
    await assertPlanFeature(session!.restaurantId, "tables");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Plan feature unavailable" },
      { status: 403 }
    );
  }

  const branchId = request.nextUrl.searchParams.get("branchId");
  const tables = await db.diningTable.findMany({
    where: {
      restaurantId: session!.restaurantId,
      ...(branchId ? { branchId } : {}),
    },
    include: {
      branch: { select: { id: true, nameAr: true, nameEn: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { number: "asc" }],
  });

  return NextResponse.json(tables);
}

export async function POST(request: NextRequest) {
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

  const body = await request.json();
  const parsed = diningTableSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const branch = await ensureBranch(session!.restaurantId, parsed.data.branchId);
  if (!branch) {
    return NextResponse.json({ error: "Branch not found" }, { status: 404 });
  }

  const count = await db.diningTable.count({
    where: { restaurantId: session!.restaurantId, branchId: parsed.data.branchId },
  });

  try {
    const table = await db.diningTable.create({
      data: {
        restaurantId: session!.restaurantId,
        branchId: parsed.data.branchId,
        name: parsed.data.name,
        number: parsed.data.number,
        seats: parsed.data.seats,
        sortOrder: parsed.data.sortOrder ?? count,
        isActive: parsed.data.isActive,
      },
    });

    return NextResponse.json(table, { status: 201 });
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
