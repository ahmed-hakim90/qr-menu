import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { productSchema } from "@/lib/validators";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const products = await db.product.findMany({
    where: { restaurantId: session!.restaurantId },
    orderBy: { sortOrder: "asc" },
    include: { category: true },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const category = await db.category.findFirst({
    where: { id: parsed.data.categoryId, restaurantId: session!.restaurantId },
  });
  if (!category) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const count = await db.product.count({
    where: { restaurantId: session!.restaurantId },
  });

  const product = await db.product.create({
    data: {
      ...parsed.data,
      image: parsed.data.image || null,
      compareAtPrice: parsed.data.compareAtPrice ?? null,
      calories: parsed.data.calories ?? null,
      prepTime: parsed.data.prepTime ?? null,
      spiceLevel: parsed.data.spiceLevel ?? null,
      restaurantId: session!.restaurantId,
      sortOrder: parsed.data.sortOrder ?? count,
    },
    include: { category: true },
  });

  const branches = await db.branch.findMany({
    where: { restaurantId: session!.restaurantId },
    select: { id: true },
  });

  if (branches.length > 0) {
    await db.productBranch.createMany({
      data: branches.map((b) => ({
        productId: product.id,
        branchId: b.id,
        isAvailable: true,
      })),
    });
  }

  return NextResponse.json(product, { status: 201 });
}
