import { NextRequest, NextResponse } from "next/server";
import {
  callWaiter,
  getSessionById,
  openOrResumeSession,
  requestBill,
} from "@/features/sessions/services/session-service";
import { openSessionSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const session = await getSessionById(sessionId);
  if (!session) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(session);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.action === "request_bill") {
    try {
      const session = await requestBill(body.sessionId);
      return NextResponse.json(session);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to request bill" },
        { status: 400 }
      );
    }
  }

  if (body.action === "call_waiter") {
    try {
      const result = await callWaiter(body.sessionId);
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to call waiter" },
        { status: 400 }
      );
    }
  }

  const parsed = openSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const session = await openOrResumeSession(parsed.data);
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to open session" },
      { status: 400 }
    );
  }
}
