import type { UserRole } from "@/generated/prisma";

export function hasPermission(
  role: UserRole,
  required: UserRole[]
): boolean {
  const hierarchy: Record<UserRole, number> = {
    OWNER: 5,
    MANAGER: 4,
    CAPTAIN: 3,
    CASHIER: 2,
    VIEWER: 1,
  };
  return required.some((r) => hierarchy[role] >= hierarchy[r]);
}
