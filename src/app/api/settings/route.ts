import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { settingsSchema } from "@/lib/validators";
import { CURRENCY_CODE, CURRENCY_SYMBOL } from "@/lib/currency";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  let settings = await db.settings.findUnique({
    where: { restaurantId: session!.restaurantId },
  });

  if (!settings) {
    settings = await db.settings.create({
      data: {
        restaurantId: session!.restaurantId,
        currency: CURRENCY_CODE,
        currencySymbol: CURRENCY_SYMBOL,
      },
    });
  }

  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const settings = await db.settings.upsert({
    where: { restaurantId: session!.restaurantId },
    create: {
      restaurantId: session!.restaurantId,
      currency: CURRENCY_CODE,
      currencySymbol: CURRENCY_SYMBOL,
      ...parsed.data,
    },
    update: {
      ...parsed.data,
      currency: CURRENCY_CODE,
      currencySymbol: CURRENCY_SYMBOL,
    },
  });

  return NextResponse.json(settings);
}
