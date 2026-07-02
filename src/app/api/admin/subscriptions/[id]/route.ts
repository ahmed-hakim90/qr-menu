import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";

const updateSubscriptionSchema = z.object({
  status: z.enum(["ACTIVE", "PENDING", "EXPIRED", "CANCELLED", "TRIAL"]).optional(),
  planId: z.string().optional(),
  paymentReference: z.string().optional(),
  paymentNotes: z.string().optional(),
  currentPeriodEnd: z.string().optional(),
  extendDays: z.coerce.number().int().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.subscription.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { extendDays, currentPeriodEnd, ...rest } = parsed.data;

  let periodEnd: Date | undefined;
  if (extendDays) {
    const base =
      existing.currentPeriodEnd && existing.currentPeriodEnd > new Date()
        ? existing.currentPeriodEnd
        : new Date();
    periodEnd = new Date(base.getTime() + extendDays * 24 * 60 * 60 * 1000);
  } else if (currentPeriodEnd) {
    periodEnd = new Date(currentPeriodEnd);
  } else if (rest.status === "ACTIVE" && !existing.currentPeriodEnd) {
    periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const subscription = await db.subscription.update({
    where: { id },
    data: {
      ...rest,
      currentPeriodStart: rest.status === "ACTIVE" ? new Date() : undefined,
      currentPeriodEnd: periodEnd,
    },
    include: {
      plan: true,
      restaurant: true,
    },
  });

  return NextResponse.json(subscription);
}
