import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/admin-api-auth";
import { getCardSettings, updateCardSettings } from "@/features/cards/services/card-settings";
import type { CardType } from "@/generated/prisma";

export async function GET() {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const settings = await getCardSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  const { error } = await requirePlatformAdmin();
  if (error) return error;

  const body = await request.json();
  const settings = await updateCardSettings({
    scanBaseUrl: body.scanBaseUrl,
    tokenLength: body.tokenLength,
    rateLimitPerMinute: body.rateLimitPerMinute,
    defaultCardType: body.defaultCardType as CardType | undefined,
  });

  return NextResponse.json(settings);
}
