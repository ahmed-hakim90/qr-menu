import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";

export async function GET() {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const restaurants = await db.restaurant.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: { include: { plan: true } },
      _count: {
        select: {
          branches: true,
          products: true,
          users: true,
        },
      },
    },
  });

  return NextResponse.json(restaurants);
}
