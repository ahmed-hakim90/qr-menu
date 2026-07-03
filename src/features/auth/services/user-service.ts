import crypto from "crypto";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import type { UserRole } from "@/generated/prisma";

export async function listUsers(restaurantId: string) {
  return db.user.findMany({
    where: { restaurantId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createUser(input: {
  restaurantId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new Error("Email already registered");
  }

  return db.user.create({
    data: {
      restaurantId: input.restaurantId,
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: input.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });
}

export async function deleteUser(
  userId: string,
  restaurantId: string,
  actorUserId: string
) {
  if (userId === actorUserId) {
    throw new Error("Cannot delete your own account");
  }

  const user = await db.user.findFirst({
    where: { id: userId, restaurantId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "OWNER") {
    const ownerCount = await db.user.count({
      where: { restaurantId, role: "OWNER" },
    });
    if (ownerCount <= 1) {
      throw new Error("Cannot delete the last owner");
    }
  }

  await db.$transaction([
    db.passwordResetToken.deleteMany({ where: { userId } }),
    db.user.delete({ where: { id: userId } }),
  ]);

  return { success: true };
}

export async function updateUser(
  userId: string,
  restaurantId: string,
  data: {
    name?: string;
    role?: UserRole;
    isActive?: boolean;
    password?: string;
  }
) {
  const user = await db.user.findFirst({
    where: { id: userId, restaurantId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return db.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      role: data.role,
      isActive: data.isActive,
      ...(data.password ? { passwordHash: await hashPassword(data.password) } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });
}

export async function createPasswordResetToken(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await db.passwordResetToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function resetPasswordWithToken(token: string, password: string) {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const resetToken = await db.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!resetToken) {
    throw new Error("Invalid or expired reset token");
  }

  await db.$transaction([
    db.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash: await hashPassword(password) },
    }),
    db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true };
}

export async function requestPasswordReset(email: string) {
  const user = await db.user.findUnique({ where: { email, isActive: true } });
  if (!user) {
    return { success: true };
  }

  const { token } = await createPasswordResetToken(user.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const resetUrl = `${appUrl}/auth/reset-password?token=${token}`;

  return { success: true, resetUrl, email: user.email };
}
