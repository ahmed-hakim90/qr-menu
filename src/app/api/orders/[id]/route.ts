import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { updateOrderStatus } from "@/features/orders/services/order-service";
import { updateOrderStatusSchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("CAPTAIN");
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const order = await updateOrderStatus(id, session!.restaurantId, parsed.data.status);
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update order" },
      { status: 400 }
    );
  }
}
