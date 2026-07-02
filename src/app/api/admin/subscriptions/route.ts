import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";

export async function GET() {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const subscriptions = await db.subscription.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      plan: true,
      restaurant: true,
    },
  });

  return NextResponse.json(subscriptions);
}
