import { db } from "@/lib/db";

export async function syncProductBranches(
  productId: string,
  restaurantId: string,
  branchIds: string[]
) {
  const branches = await db.branch.findMany({
    where: {
      restaurantId,
      id: { in: branchIds },
    },
    select: { id: true },
  });

  if (branches.length !== branchIds.length) {
    throw new Error("One or more branches are invalid");
  }

  await db.productBranch.deleteMany({
    where: {
      productId,
      branchId: { notIn: branchIds },
    },
  });

  if (branchIds.length === 0) {
    return;
  }

  await db.productBranch.createMany({
    data: branchIds.map((branchId) => ({
      productId,
      branchId,
      isAvailable: true,
    })),
    skipDuplicates: true,
  });
}
