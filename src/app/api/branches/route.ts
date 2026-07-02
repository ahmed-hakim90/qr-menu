import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { branchCreateSchema } from "@/lib/validators";
import { assertPlanLimit } from "@/lib/plans";
import { slugify } from "@/lib/utils";

async function uniqueBranchSlug(base: string) {
  const root = slugify(base) || "branch";
  let slug = root;
  let index = 2;

  while (await db.branch.findUnique({ where: { slug } })) {
    slug = `${root}-${index}`;
    index += 1;
  }

  return slug;
}

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const branches = await db.branch.findMany({
    where: { restaurantId: session!.restaurantId },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(branches);
}

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  try {
    await assertPlanLimit(session!.restaurantId, "branches");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Plan limit reached" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const parsed = branchCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const count = await db.branch.count({
    where: { restaurantId: session!.restaurantId },
  });

  const slug = await uniqueBranchSlug(parsed.data.nameEn);

  const branch = await db.branch.create({
    data: {
      ...parsed.data,
      restaurantId: session!.restaurantId,
      slug,
      sortOrder: count,
      logo: parsed.data.logo || null,
      coverImage: parsed.data.coverImage || null,
    },
  });

  const products = await db.product.findMany({
    where: { restaurantId: session!.restaurantId },
    select: { id: true },
  });

  if (products.length > 0) {
    await db.productBranch.createMany({
      data: products.map((product) => ({
        productId: product.id,
        branchId: branch.id,
        isAvailable: true,
      })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json(branch, { status: 201 });
}
