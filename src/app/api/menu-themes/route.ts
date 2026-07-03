import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { menuThemeSelectSchema } from "@/lib/validators";
import {
  getRestaurantThemeState,
  selectMenuTheme,
} from "@/features/themes/services/theme-service";

export async function GET() {
  const { session, error } = await requireSession();
  if (error) return error;

  const state = await getRestaurantThemeState(session!.restaurantId);
  return NextResponse.json(state);
}

export async function PATCH(request: NextRequest) {
  const { session, error } = await requireSession("MANAGER");
  if (error) return error;

  const body = await request.json();
  const parsed = menuThemeSelectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const settings = await selectMenuTheme(
      session!.restaurantId,
      parsed.data.menuTheme
    );
    return NextResponse.json(settings);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to select theme";
    const status = message === "Theme not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
