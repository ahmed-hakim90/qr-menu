import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function UsersPage() {
  const session = await getSession();
  if (!session) return null;

  const users = await db.user.findMany({
    where: { restaurantId: session.restaurantId },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="grid gap-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <Badge>{user.role}</Badge>
                <Badge variant={user.isActive ? "success" : "secondary"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
