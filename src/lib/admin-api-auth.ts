import { NextResponse } from "next/server";
import { getPlatformSession } from "@/lib/platform-auth";

export async function requirePlatformAdmin() {
  const session = await getPlatformSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}
