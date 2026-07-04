import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";
import { cardInclude } from "@/features/cards/services/card-service";

export async function GET(request: NextRequest) {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const activeOnly = searchParams.get("active") !== "false";

  const where = activeOnly ? { active: true } : {};

  const [items, total] = await Promise.all([
    db.cardAssignment.findMany({
      where,
      include: {
        card: { select: { token: true, serialNumber: true, status: true } },
        restaurant: { select: { id: true, nameEn: true } },
        branch: { select: { id: true, nameEn: true } },
        table: { select: { id: true, number: true, name: true } },
        assignedBy: { select: { name: true } },
      },
      orderBy: { assignedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.cardAssignment.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requirePlatformAdmin();
  if (error) return error;

  const body = await request.json();
  const { assignCard } = await import("@/features/cards/services/card-service");

  const assignment = await assignCard({
    cardId: body.cardId,
    restaurantId: body.restaurantId,
    branchId: body.branchId,
    tableId: body.tableId,
    assignedById: session.id,
  });

  return NextResponse.json(assignment, { status: 201 });
}
