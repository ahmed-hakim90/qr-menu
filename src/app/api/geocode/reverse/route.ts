import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { reverseGeocode } from "@/lib/geocoding";

export async function GET(request: NextRequest) {
  const { error } = await requireSession();
  if (error) return error;

  const latParam = request.nextUrl.searchParams.get("lat");
  const lngParam = request.nextUrl.searchParams.get("lng");

  const latitude = latParam ? Number(latParam) : NaN;
  const longitude = lngParam ? Number(lngParam) : NaN;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: "Valid lat and lng are required" }, { status: 400 });
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: "Coordinates out of range" }, { status: 400 });
  }

  try {
    const addresses = await reverseGeocode(latitude, longitude);
    return NextResponse.json(addresses);
  } catch {
    return NextResponse.json({ error: "Could not resolve address" }, { status: 502 });
  }
}
