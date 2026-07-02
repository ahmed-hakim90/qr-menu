import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { productSchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.product.findFirst({
    where: { id, restaurantId: session!.restaurantId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (parsed.data.categoryId) {
    const category = await db.category.findFirst({
      where: { id: parsed.data.categoryId, restaurantId: session!.restaurantId },
    });
    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
  }

  const product = await db.product.update({
    where: { id },
    data: {
      ...parsed.data,
      image: parsed.data.image === "" ? null : parsed.data.image,
      compareAtPrice: parsed.data.compareAtPrice ?? undefined,
      calories: parsed.data.calories ?? undefined,
      prepTime: parsed.data.prepTime ?? undefined,
      spiceLevel: parsed.data.spiceLevel ?? undefined,
    },
    include: { category: true },
  });

  return NextResponse.json(product);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const { id } = await params;
  const existing = await db.product.findFirst({
    where: { id, restaurantId: session!.restaurantId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
