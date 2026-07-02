import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { addonSchema } from "@/lib/validators";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const addons = await db.addon.findMany({
    where: { restaurantId: session!.restaurantId },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(addons);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const body = await request.json();
  const parsed = addonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const count = await db.addon.count({
    where: { restaurantId: session!.restaurantId },
  });

  const addon = await db.addon.create({
    data: {
      ...parsed.data,
      restaurantId: session!.restaurantId,
      sortOrder: parsed.data.sortOrder ?? count,
    },
  });

  return NextResponse.json(addon, { status: 201 });
}
