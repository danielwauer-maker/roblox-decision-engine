import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const apiBase = process.env.API_BASE_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  const token = (await cookies()).get("rde_pilot_session")?.value;
  if (!token) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  const upstream = await fetch(`${apiBase}/v1/billing/reactivate`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: await request.text(), cache: "no-store" });
  return new NextResponse(await upstream.text(), { status: upstream.status, headers: { "Content-Type": "application/json" } });
}
