import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { categorySchema } from "@/lib/validators";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const categories = await db.category.findMany({
    where: { restaurantId: session!.restaurantId },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const body = await request.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const count = await db.category.count({
    where: { restaurantId: session!.restaurantId },
  });

  const category = await db.category.create({
    data: {
      ...parsed.data,
      image: parsed.data.image || null,
      restaurantId: session!.restaurantId,
      sortOrder: parsed.data.sortOrder ?? count,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
