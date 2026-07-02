import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import {
  callWaiter,
  closeSession,
  getSessionById,
  requestBill,
} from "@/features/sessions/services/session-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("CAPTAIN");
  if (error) return error;

  const { id } = await params;
  const tableSession = await getSessionById(id);
  if (!tableSession || tableSession.restaurantId !== session!.restaurantId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(tableSession);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("CASHIER");
  if (error) return error;

  const { id } = await params;
  const body = await request.json();

  try {
    if (body.action === "close") {
      const tableSession = await closeSession(id);
      if (tableSession.restaurantId !== session!.restaurantId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(tableSession);
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update session" },
      { status: 400 }
    );
  }
}
