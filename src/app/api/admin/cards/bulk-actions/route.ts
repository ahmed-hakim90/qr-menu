import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";
import { unassignCard, updateCardStatus } from "@/features/cards/services/card-service";
import type { CardStatus } from "@/generated/prisma";

export async function POST(request: NextRequest) {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const body = await request.json();
  const { ids, action, status } = body as {
    ids: string[];
    action: "disable" | "unassign" | "status";
    status?: CardStatus;
  };

  if (!ids?.length) {
    return NextResponse.json({ error: "No cards selected" }, { status: 400 });
  }

  if (action === "unassign") {
    await Promise.all(ids.map((id) => unassignCard(id)));
  } else if (action === "disable") {
    await Promise.all(ids.map((id) => updateCardStatus(id, "DISABLED")));
  } else if (action === "status" && status) {
    await Promise.all(ids.map((id) => updateCardStatus(id, status)));
  }

  return NextResponse.json({ ok: true, count: ids.length });
}
