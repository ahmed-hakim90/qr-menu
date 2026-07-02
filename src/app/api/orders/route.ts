import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { listCaptainOrders, listOrderBoard } from "@/features/orders/services/order-service";

export async function GET(request: NextRequest) {
  const { session, error } = await requireSession("CAPTAIN");
  if (error) return error;

  const branchId = request.nextUrl.searchParams.get("branchId") || undefined;
  const view = request.nextUrl.searchParams.get("view");

  const orders =
    view === "captain"
      ? await listCaptainOrders(session!.restaurantId, branchId)
      : await listOrderBoard(session!.restaurantId, branchId);

  return NextResponse.json(orders);
}
