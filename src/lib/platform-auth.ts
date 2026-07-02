import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";
import { hashPassword, verifyPassword } from "./auth";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "dev-secret-change-me"
);

const COOKIE_NAME = "platform_session";

export interface PlatformSession {
  id: string;
  email: string;
  name: string;
}

export async function createPlatformSession(admin: PlatformSession) {
  const token = await new SignJWT({ admin, type: "platform" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getPlatformSession(): Promise<PlatformSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.type !== "platform") return null;
    return payload.admin as PlatformSession;
  } catch {
    return null;
  }
}

export async function destroyPlatformSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function loginPlatformAdmin(email: string, password: string) {
  const admin = await db.platformAdmin.findUnique({ where: { email } });
  if (!admin || !admin.isActive) return null;

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) return null;

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
  } satisfies PlatformSession;
}

export { hashPassword };
