import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { menuThemePurchaseSchema } from "@/lib/validators";
import { submitThemePurchaseRequest } from "@/features/themes/services/theme-service";

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const body = await request.json();
  const parsed = menuThemePurchaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const purchase = await submitThemePurchaseRequest({
      restaurantId: session!.restaurantId,
      themeSlug: parsed.data.themeSlug,
      paymentReference: parsed.data.paymentReference,
      paymentNotes: parsed.data.paymentNotes,
    });
    return NextResponse.json(purchase, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to submit purchase";
    const status = message === "Theme not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
