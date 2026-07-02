import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { BranchesManager } from "@/components/dashboard/branches-manager";

export default async function BranchesPage() {
  const session = await getSession();
  if (!session) return null;

  const branches = await db.branch.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { sortOrder: "asc" },
  });

  return <BranchesManager branches={branches} />;
}
