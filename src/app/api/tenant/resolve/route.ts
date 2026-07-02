import { NextRequest, NextResponse } from "next/server";
import { resolveRestaurantByHost } from "@/lib/tenant-host";

export async function GET(request: NextRequest) {
  const host = request.nextUrl.searchParams.get("host");
  if (!host) {
    return NextResponse.json({ error: "host is required" }, { status: 400 });
  }

  const restaurant = await resolveRestaurantByHost(host);
  if (!restaurant || restaurant.branches.length === 0) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const branchSlug = request.nextUrl.searchParams.get("branch");
  const branch =
    (branchSlug
      ? restaurant.branches.find((item) => item.slug === branchSlug)
      : null) || restaurant.branches[0];

  return NextResponse.json({
    restaurantId: restaurant.id,
    branchSlug: branch.slug,
    subdomain: restaurant.subdomain,
    customDomain: restaurant.customDomain,
  });
}
