import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";
import { getDashboardStats } from "@/features/cards/services/card-service";

export async function GET() {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const stats = await getDashboardStats();
  return NextResponse.json(stats);
}
