import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ExternalLink } from "lucide-react";

export default async function BranchesPage() {
  const session = await getSession();
  if (!session) return null;

  const branches = await db.branch.findMany({
    where: { restaurantId: session.restaurantId },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Branches</h1>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add Branch
        </Button>
      </div>
      <div className="grid gap-4">
        {branches.map((branch) => (
          <Card key={branch.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-semibold text-lg">{branch.nameEn}</h3>
                <p className="text-sm text-muted-foreground">{branch.nameAr}</p>
                <p className="text-sm text-muted-foreground mt-1">{branch.addressEn}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={branch.isActive ? "success" : "secondary"}>
                    {branch.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/menu/${branch.slug}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                    View Menu
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
