import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { getTodayAnalytics } from "@/features/analytics/services/analytics-service";

export async function GET(request: NextRequest) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const branchId = request.nextUrl.searchParams.get("branchId") || undefined;
  const analytics = await getTodayAnalytics(session!.restaurantId, branchId);
  return NextResponse.json(analytics);
}
