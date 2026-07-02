import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { listActiveSessions } from "@/features/sessions/services/session-service";

export async function GET(request: NextRequest) {
  const { session, error } = await requireSession("CAPTAIN");
  if (error) return error;

  const branchId = request.nextUrl.searchParams.get("branchId") || undefined;
  const sessions = await listActiveSessions(session!.restaurantId, branchId);
  return NextResponse.json(sessions);
}
