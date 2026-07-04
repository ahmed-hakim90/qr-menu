"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronDown, ExternalLink, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildMenuUrl } from "@/lib/menu-url";
import type { Plan, Restaurant, Subscription, SubscriptionStatus, UserRole } from "@/generated/prisma";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

type BranchRow = {
  slug: string;
};

type RestaurantRow = Restaurant & {
  subscription: (Subscription & { plan: Plan }) | null;
  users: UserRow[];
  branches: BranchRow[];
  _count: { branches: number; products: number; users: number };
};

interface RestaurantsManagerProps {
  restaurants: RestaurantRow[];
  appDomain: string;
}

function statusVariant(status: SubscriptionStatus) {
  switch (status) {
    case "ACTIVE":
      return "success" as const;
    case "PENDING":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

export function RestaurantsManager({ restaurants, appDomain }: RestaurantsManagerProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Restaurants</h1>
        <p className="text-sm text-muted-foreground">{restaurants.length} tenants on the platform</p>
      </div>

      <div className="grid gap-4">
        {restaurants.map((restaurant) => {
          const isOpen = expanded === restaurant.id;
          const branchSlug = restaurant.branches[0]?.slug;
          const menuUrl = branchSlug
            ? buildMenuUrl({
                branchSlug,
                customDomain: restaurant.customDomain,
              })
            : null;
          return (
            <Card key={restaurant.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{restaurant.nameEn}</h3>
                    <p className="text-sm text-muted-foreground">{restaurant.nameAr}</p>
                    {menuUrl ? (
                      <a
                        href={menuUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-1 font-mono"
                      >
                        {menuUrl}
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">No active branch</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {restaurant.subdomain}.{appDomain}
                      {restaurant.customDomain ? ` · ${restaurant.customDomain}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {restaurant._count.branches} branches · {restaurant._count.products} products ·{" "}
                      {restaurant._count.users} users
                    </p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2">
                    {restaurant.subscription ? (
                      <Badge variant={statusVariant(restaurant.subscription.status)}>
                        {restaurant.subscription.plan.nameEn} · {restaurant.subscription.status}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">No subscription</Badge>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpanded(isOpen ? null : restaurant.id)}
                      >
                        <Users className="h-4 w-4" />
                        {restaurant._count.users} users
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </Button>
                      {restaurant.subscription?.status === "PENDING" && (
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              await fetch(`/api/admin/subscriptions/${restaurant.subscription!.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: "ACTIVE" }),
                              });
                              router.refresh();
                              toast.success("Subscription activated");
                            } catch {
                              toast.error("Failed to activate");
                            }
                          }}
                        >
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-border/50 pt-4 space-y-2">
                    {restaurant.users.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No users found.</p>
                    ) : (
                      restaurant.users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-2 text-sm"
                        >
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-muted-foreground">{user.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{user.role}</Badge>
                            <Badge variant={user.isActive ? "success" : "secondary"}>
                              {user.isActive ? "Active" : "Disabled"}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
