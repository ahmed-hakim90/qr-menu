import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";
import type { PrintQueueStatus, PrintSheetType } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const status = request.nextUrl.searchParams.get("status");

  const items = await db.printQueueItem.findMany({
    where: status ? { status: status as PrintQueueStatus } : {},
    include: {
      card: {
        include: {
          assignments: {
            where: { active: true },
            include: {
              restaurant: { select: { nameEn: true } },
              table: { select: { number: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const body = await request.json();
  const cardIds: string[] = body.cardIds ?? [];

  if (cardIds.length === 0) {
    return NextResponse.json({ error: "No cards selected" }, { status: 400 });
  }

  const items = await db.printQueueItem.createMany({
    data: cardIds.map((cardId) => ({
      cardId,
      sheetType: (body.sheetType ?? "A4") as PrintSheetType,
      includeRestaurantName: Boolean(body.includeRestaurantName),
      includeTableNumber: Boolean(body.includeTableNumber),
    })),
  });

  return NextResponse.json({ created: items.count }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const body = await request.json();
  const { ids, status } = body as { ids: string[]; status: PrintQueueStatus };

  await db.printQueueItem.updateMany({
    where: { id: { in: ids } },
    data: {
      status,
      ...(status === "COMPLETED" ? { completedAt: new Date() } : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
