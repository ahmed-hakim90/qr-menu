import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";

const planUpdateSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  priceMonthly: z.coerce.number().min(0).optional(),
  maxBranches: z.coerce.number().int().min(1).optional(),
  maxProducts: z.coerce.number().int().min(1).optional(),
  maxUsers: z.coerce.number().int().min(1).optional(),
  customDomain: z.boolean().optional(),
  hasTables: z.boolean().optional(),
  hasOrdering: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = planUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.plan.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const plan = await db.plan.update({ where: { id }, data: parsed.data });
  return NextResponse.json(plan);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const { id } = await params;
  const count = await db.subscription.count({ where: { planId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: "Cannot delete a plan with active subscriptions. Deactivate it instead." },
      { status: 400 }
    );
  }

  await db.plan.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
