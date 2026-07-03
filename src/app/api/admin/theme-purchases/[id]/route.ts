import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";

const updateThemePurchaseSchema = z.object({
  status: z.enum(["ACTIVE", "PENDING"]),
  activateTheme: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateThemePurchaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.themePurchase.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const purchase = await db.$transaction(async (tx) => {
    const updated = await tx.themePurchase.update({
      where: { id },
      data: { status: parsed.data.status },
      include: { restaurant: true },
    });

    if (parsed.data.status === "ACTIVE" && parsed.data.activateTheme !== false) {
      await tx.settings.upsert({
        where: { restaurantId: updated.restaurantId },
        create: {
          restaurantId: updated.restaurantId,
          menuTheme: updated.themeSlug,
        },
        update: {
          menuTheme: updated.themeSlug,
        },
      });
    }

    return updated;
  });

  return NextResponse.json(purchase);
}
