import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";

const planSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  nameAr: z.string().min(1),
  nameEn: z.string().min(1),
  priceMonthly: z.coerce.number().min(0),
  maxBranches: z.coerce.number().int().min(1),
  maxProducts: z.coerce.number().int().min(1),
  maxUsers: z.coerce.number().int().min(1),
  customDomain: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const plans = await db.plan.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { subscriptions: true } } },
  });

  return NextResponse.json(plans);
}

export async function POST(request: NextRequest) {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = planSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.plan.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return NextResponse.json({ error: "Plan slug already exists" }, { status: 409 });
  }

  const plan = await db.plan.create({ data: parsed.data });
  return NextResponse.json(plan, { status: 201 });
}
