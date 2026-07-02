import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { productSchema } from "@/lib/validators";
import { syncProductBranches } from "@/lib/product-branches";

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

  const { branchIds, ...productData } = parsed.data;

  if (productData.categoryId) {
    const category = await db.category.findFirst({
      where: { id: productData.categoryId, restaurantId: session!.restaurantId },
    });
    if (!category) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
  }

  await db.product.update({
    where: { id },
    data: {
      ...productData,
      image: productData.image === "" ? null : productData.image,
      compareAtPrice: productData.compareAtPrice ?? undefined,
      calories: productData.calories ?? undefined,
      prepTime: productData.prepTime ?? undefined,
      spiceLevel: productData.spiceLevel ?? undefined,
    },
  });

  if (branchIds) {
    try {
      await syncProductBranches(id, session!.restaurantId, branchIds);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Invalid branches" },
        { status: 400 }
      );
    }
  }

  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: true,
      productBranches: { include: { branch: true } },
    },
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
