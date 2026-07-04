import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";

export async function GET(request: NextRequest) {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const search = searchParams.get("search")?.trim();
  const restaurantId = searchParams.get("restaurantId");

  const where = {
    ...(restaurantId ? { restaurantId } : {}),
    ...(search
      ? {
          OR: [
            { token: { contains: search, mode: "insensitive" as const } },
            { device: { contains: search, mode: "insensitive" as const } },
            { browser: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    db.cardScanLog.findMany({
      where,
      include: {
        card: { select: { serialNumber: true, token: true } },
        restaurant: { select: { nameEn: true } },
        branch: { select: { nameEn: true } },
        table: { select: { number: true, name: true } },
      },
      orderBy: { scannedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.cardScanLog.count({ where }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}
