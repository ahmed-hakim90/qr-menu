import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";
import {
  createPlatformCard,
  cardInclude,
} from "@/features/cards/services/card-service";
import type { CardStatus, CardType } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const search = searchParams.get("search")?.trim();
  const status = searchParams.get("status") as CardStatus | null;
  const cardType = searchParams.get("cardType") as CardType | null;
  const nfcOnly = searchParams.get("nfcOnly") === "true";
  const qrOnly = searchParams.get("qrOnly") === "true";

  const where = {
    ...(status ? { status } : {}),
    ...(cardType ? { cardType } : {}),
    ...(nfcOnly ? { cardType: { in: ["NFC_ONLY", "QR_AND_NFC"] as CardType[] } } : {}),
    ...(qrOnly ? { cardType: { in: ["QR_ONLY", "QR_AND_NFC"] as CardType[] } } : {}),
    ...(search
      ? {
          OR: [
            { token: { contains: search, mode: "insensitive" as const } },
            { serialNumber: { contains: search, mode: "insensitive" as const } },
            { nfcUid: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.platformCard.findMany({
      where,
      include: cardInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.platformCard.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}

export async function POST(request: NextRequest) {
  const { session, error } = await requirePlatformAdmin();
  if (error) return error;

  const body = await request.json();
  const cardType = (body.cardType ?? "QR_ONLY") as CardType;

  const card = await createPlatformCard({
    cardType,
    createdById: session.id,
    nfcUid: body.nfcUid,
  });

  return NextResponse.json(card, { status: 201 });
}
