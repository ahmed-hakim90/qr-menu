import { db } from "@/lib/db";
import type { Plan, Subscription, SubscriptionStatus } from "@/generated/prisma";

export const ACTIVE_STATUSES: SubscriptionStatus[] = ["TRIAL", "ACTIVE"];

export interface TenantUsage {
  branches: number;
  products: number;
  users: number;
}

export interface TenantLimits {
  maxBranches: number;
  maxProducts: number;
  maxUsers: number;
  customDomain: boolean;
}

export async function getRestaurantSubscription(restaurantId: string) {
  return db.subscription.findUnique({
    where: { restaurantId },
    include: { plan: true },
  });
}

export async function getRestaurantUsage(restaurantId: string): Promise<TenantUsage> {
  const [branches, products, users] = await Promise.all([
    db.branch.count({ where: { restaurantId } }),
    db.product.count({ where: { restaurantId } }),
    db.user.count({ where: { restaurantId, isActive: true } }),
  ]);

  return { branches, products, users };
}

export function getEffectiveLimits(
  subscription: (Subscription & { plan: Plan }) | null
): TenantLimits {
  if (!subscription || !ACTIVE_STATUSES.includes(subscription.status)) {
    return {
      maxBranches: 1,
      maxProducts: 30,
      maxUsers: 2,
      customDomain: false,
    };
  }

  return {
    maxBranches: subscription.plan.maxBranches,
    maxProducts: subscription.plan.maxProducts,
    maxUsers: subscription.plan.maxUsers,
    customDomain: subscription.plan.customDomain,
  };
}

export function isWithinLimit(current: number, max: number) {
  return current < max;
}

export async function assertPlanLimit(
  restaurantId: string,
  resource: keyof TenantUsage
) {
  const [subscription, usage] = await Promise.all([
    getRestaurantSubscription(restaurantId),
    getRestaurantUsage(restaurantId),
  ]);

  const limits = getEffectiveLimits(subscription);
  const limitKey =
    resource === "branches"
      ? "maxBranches"
      : resource === "products"
        ? "maxProducts"
        : "maxUsers";

  if (!isWithinLimit(usage[resource], limits[limitKey])) {
    throw new Error(`Plan limit reached for ${resource}. Upgrade your plan to continue.`);
  }
}
