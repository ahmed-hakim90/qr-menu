import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";
import {
  assignCard,
  cardInclude,
  regenerateCardQr,
  unassignCard,
  updateCardStatus,
} from "@/features/cards/services/card-service";
import type { CardStatus } from "@/generated/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const { id } = await context.params;
  const card = await db.platformCard.findUnique({
    where: { id },
    include: {
      ...cardInclude,
      assignments: {
        orderBy: { assignedAt: "desc" },
        include: {
          restaurant: { select: { id: true, nameEn: true, nameAr: true } },
          branch: { select: { id: true, nameEn: true, slug: true } },
          table: { select: { id: true, name: true, number: true } },
          assignedBy: { select: { id: true, name: true } },
        },
      },
      scanLogs: { orderBy: { scannedAt: "desc" }, take: 20 },
    },
  });

  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(card);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();

  if (body.status) {
    const card = await updateCardStatus(id, body.status as CardStatus);
    return NextResponse.json(card);
  }

  if (body.nfcUid !== undefined) {
    const card = await db.platformCard.update({
      where: { id },
      data: { nfcUid: body.nfcUid },
    });
    return NextResponse.json(card);
  }

  return NextResponse.json({ error: "No valid fields" }, { status: 400 });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { session, error } = await requirePlatformAdmin();
  if (error) return error;

  const { id } = await context.params;
  const body = await request.json();
  const action = body.action as string;

  switch (action) {
    case "assign": {
      const assignment = await assignCard({
        cardId: id,
        restaurantId: body.restaurantId,
        branchId: body.branchId,
        tableId: body.tableId,
        assignedById: session.id,
      });
      return NextResponse.json(assignment);
    }
    case "unassign": {
      const card = await unassignCard(id);
      return NextResponse.json(card);
    }
    case "disable": {
      const card = await updateCardStatus(id, "DISABLED");
      return NextResponse.json(card);
    }
    case "regenerate-qr": {
      const card = await regenerateCardQr(id);
      return NextResponse.json(card);
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
