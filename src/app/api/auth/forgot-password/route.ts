import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/features/auth/services/user-service";
import { forgotPasswordSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const result = await requestPasswordReset(parsed.data.email);
  return NextResponse.json(result);
}
