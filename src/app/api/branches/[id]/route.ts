import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { branchSchema } from "@/lib/validators";
import { normalizeBranchData } from "@/lib/branch-data";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = branchSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const existing = await db.branch.findFirst({
      where: { id, restaurantId: session!.restaurantId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const branch = await db.branch.update({
      where: { id },
      data: normalizeBranchData(parsed.data),
    });

    return NextResponse.json(branch);
  } catch (err) {
    console.error("Branch update failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update branch" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const { id } = await params;
  const existing = await db.branch.findFirst({
    where: { id, restaurantId: session!.restaurantId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const branchCount = await db.branch.count({
    where: { restaurantId: session!.restaurantId },
  });
  if (branchCount <= 1) {
    return NextResponse.json({ error: "At least one branch is required" }, { status: 400 });
  }

  await db.branch.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
