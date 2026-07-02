import { NextResponse } from "next/server";
import { getSession, hasPermission } from "@/lib/auth";
import type { UserRole } from "@/generated/prisma";

export async function requireSession(minRole: UserRole = "VIEWER") {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (!hasPermission(session.role, [minRole])) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}
