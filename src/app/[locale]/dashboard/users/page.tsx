import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UsersManager } from "@/components/users/users-manager";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) return null;

  const users = await db.user.findMany({
    where: { restaurantId: session.restaurantId },
    select: { id: true, name: true, email: true, role: true, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">
          Manage staff roles: Owner, Manager, Captain, Cashier, Viewer.
        </p>
      </div>
      <UsersManager initialUsers={users} />
    </div>
  );
}
