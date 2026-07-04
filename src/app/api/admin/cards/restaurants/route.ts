import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";

export async function GET() {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const restaurants = await db.restaurant.findMany({
    select: {
      id: true,
      nameEn: true,
      branches: {
        where: { isActive: true },
        select: {
          id: true,
          nameEn: true,
          diningTables: {
            where: { isActive: true },
            select: { id: true, number: true, name: true },
            orderBy: { number: "asc" },
          },
        },
      },
    },
    orderBy: { nameEn: "asc" },
  });

  return NextResponse.json(restaurants);
}
