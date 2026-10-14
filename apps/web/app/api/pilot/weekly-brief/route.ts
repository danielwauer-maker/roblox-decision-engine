import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
const apiBase = process.env.API_BASE_URL ?? "http://localhost:8000";
export async function GET(request: NextRequest) {
  const token = (await cookies()).get("rde_pilot_session")?.value;
  if (!token) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("connection_id");
  const suffix = id ? `?connection_id=${encodeURIComponent(id)}` : "";
  const upstream = await fetch(`${apiBase}/v1/tenant/weekly-brief${suffix}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  return new NextResponse(await upstream.text(), { status: upstream.status, headers: { "Content-Type": "application/json" } });
}
