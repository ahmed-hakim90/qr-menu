import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";

export async function GET() {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const batches = await db.cardBatch.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { cards: true } },
    },
  });

  return NextResponse.json({ batches });
}
