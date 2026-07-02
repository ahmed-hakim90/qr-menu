import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { productSchema } from "@/lib/validators";
import { assertPlanLimit } from "@/lib/plans";
import { syncProductBranches } from "@/lib/product-branches";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const products = await db.product.findMany({
    where: { restaurantId: session!.restaurantId },
    orderBy: { sortOrder: "asc" },
    include: {
      category: true,
      productBranches: { include: { branch: true } },
    },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  try {
    await assertPlanLimit(session!.restaurantId, "products");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Plan limit reached" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { branchIds, ...productData } = parsed.data;

  const category = await db.category.findFirst({
    where: { id: productData.categoryId, restaurantId: session!.restaurantId },
  });
  if (!category) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const count = await db.product.count({
    where: { restaurantId: session!.restaurantId },
  });

  const product = await db.product.create({
    data: {
      ...productData,
      image: productData.image || null,
      compareAtPrice: productData.compareAtPrice ?? null,
      calories: productData.calories ?? null,
      prepTime: productData.prepTime ?? null,
      spiceLevel: productData.spiceLevel ?? null,
      restaurantId: session!.restaurantId,
      sortOrder: productData.sortOrder ?? count,
    },
    include: { category: true },
  });

  const branches = await db.branch.findMany({
    where: { restaurantId: session!.restaurantId },
    select: { id: true },
  });

  const selectedBranchIds =
    branchIds && branchIds.length > 0 ? branchIds : branches.map((branch) => branch.id);

  if (selectedBranchIds.length > 0) {
    await syncProductBranches(product.id, session!.restaurantId, selectedBranchIds);
  }

  const fullProduct = await db.product.findUnique({
    where: { id: product.id },
    include: {
      category: true,
      productBranches: { include: { branch: true } },
    },
  });

  return NextResponse.json(fullProduct, { status: 201 });
}
