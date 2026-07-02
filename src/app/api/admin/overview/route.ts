import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";

export async function GET() {
  const { session, error } = await requirePlatformAdmin();
  if (error) return error;

  const [
    restaurants,
    pendingSubscriptions,
    activeSubscriptions,
    totalProducts,
    totalBranches,
  ] = await Promise.all([
    db.restaurant.count(),
    db.subscription.count({ where: { status: "PENDING" } }),
    db.subscription.count({ where: { status: { in: ["ACTIVE", "TRIAL"] } } }),
    db.product.count(),
    db.branch.count(),
  ]);

  return NextResponse.json({
    admin: session,
    stats: {
      restaurants,
      pendingSubscriptions,
      activeSubscriptions,
      totalProducts,
      totalBranches,
    },
  });
}
