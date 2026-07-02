import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { domainSchema } from "@/lib/validators";
import { getEffectiveLimits, getRestaurantSubscription } from "@/lib/plans";
import { getAppDomain } from "@/lib/tenant-host";

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "admin",
  "dashboard",
  "app",
  "mail",
  "support",
]);

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const restaurant = await db.restaurant.findUnique({
    where: { id: session!.restaurantId },
    select: { subdomain: true, customDomain: true, slug: true },
  });

  if (!restaurant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const subscription = await getRestaurantSubscription(session!.restaurantId);
  const limits = getEffectiveLimits(subscription);
  const appDomain = getAppDomain();

  return NextResponse.json({
    subdomain: restaurant.subdomain || restaurant.slug,
    customDomain: restaurant.customDomain || "",
    appDomain,
    customDomainAllowed: limits.customDomain,
  });
}

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireSession("OWNER");
  if (error) return error;

  const body = await request.json();
  const parsed = domainSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (RESERVED_SUBDOMAINS.has(parsed.data.subdomain)) {
    return NextResponse.json({ error: "Subdomain is reserved" }, { status: 400 });
  }

  const existingSubdomain = await db.restaurant.findFirst({
    where: {
      subdomain: parsed.data.subdomain,
      NOT: { id: session!.restaurantId },
    },
  });
  if (existingSubdomain) {
    return NextResponse.json({ error: "Subdomain already taken" }, { status: 409 });
  }

  const customDomain = parsed.data.customDomain || null;
  if (customDomain) {
    const subscription = await getRestaurantSubscription(session!.restaurantId);
    const limits = getEffectiveLimits(subscription);
    if (!limits.customDomain) {
      return NextResponse.json(
        { error: "Custom domain is not available on your current plan" },
        { status: 403 }
      );
    }

    const existingDomain = await db.restaurant.findFirst({
      where: {
        customDomain,
        NOT: { id: session!.restaurantId },
      },
    });
    if (existingDomain) {
      return NextResponse.json({ error: "Custom domain already taken" }, { status: 409 });
    }
  }

  const restaurant = await db.restaurant.update({
    where: { id: session!.restaurantId },
    data: {
      subdomain: parsed.data.subdomain,
      customDomain,
    },
    select: { subdomain: true, customDomain: true, slug: true },
  });

  return NextResponse.json(restaurant);
}
