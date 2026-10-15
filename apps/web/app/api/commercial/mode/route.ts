import { NextResponse } from "next/server";

const apiBase = process.env.API_BASE_URL ?? "http://localhost:8000";

export async function GET() {
  const upstream = await fetch(`${apiBase}/v1/billing/plans`, { cache: "no-store" });
  if (!upstream.ok) return NextResponse.json({ detail: "Commercial mode is unavailable" }, { status: upstream.status });
  const payload = await upstream.json();
  return NextResponse.json({ commercial_mode: payload.commercial_mode === "standard" ? "standard" : "pilot" });
}
