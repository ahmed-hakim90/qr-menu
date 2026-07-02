import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/api-auth";
import { branchSchema } from "@/lib/validators";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const { id } = await params;
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
    data: {
      ...parsed.data,
      logo: parsed.data.logo === "" ? null : parsed.data.logo,
      coverImage: parsed.data.coverImage === "" ? null : parsed.data.coverImage,
    },
  });

  return NextResponse.json(branch);
}
