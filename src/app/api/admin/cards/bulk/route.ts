import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";
import { bulkCreateCards } from "@/features/cards/services/card-service";
import type { CardType } from "@/generated/prisma";

export async function POST(request: NextRequest) {
  const { session, error } = await requirePlatformAdmin();
  if (error) return error;

  const body = await request.json();
  const quantity = Number(body.quantity ?? 10);
  const cardType = (body.cardType ?? "QR_ONLY") as CardType;
  const batchName = body.batchName ?? `Batch ${new Date().toISOString().slice(0, 10)}`;

  if (quantity < 1 || quantity > 1000) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  const capped = Math.min(quantity, 1000);
  const result = await bulkCreateCards({
    quantity: capped,
    cardType,
    batchName,
    createdById: session.id,
  });

  return NextResponse.json(result, { status: 201 });
}
