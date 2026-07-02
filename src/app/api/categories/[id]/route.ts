import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { categorySchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const parsed = categorySchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await db.category.findFirst({
    where: { id, restaurantId: session!.restaurantId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const category = await db.category.update({
    where: { id },
    data: {
      ...parsed.data,
      image: parsed.data.image === "" ? null : parsed.data.image,
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const { id } = await params;
  const existing = await db.category.findFirst({
    where: { id, restaurantId: session!.restaurantId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
