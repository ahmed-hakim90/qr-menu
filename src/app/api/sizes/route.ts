import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { sizeSchema } from "@/lib/validators";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const sizes = await db.size.findMany({
    where: { restaurantId: session!.restaurantId },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(sizes);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const body = await request.json();
  const parsed = sizeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const count = await db.size.count({
    where: { restaurantId: session!.restaurantId },
  });

  const size = await db.size.create({
    data: {
      ...parsed.data,
      restaurantId: session!.restaurantId,
      sortOrder: parsed.data.sortOrder ?? count,
    },
  });

  return NextResponse.json(size, { status: 201 });
}
