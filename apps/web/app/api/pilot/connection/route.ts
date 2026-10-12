import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const apiBase = process.env.API_BASE_URL ?? "http://localhost:8000";

async function token() {
  return (await cookies()).get("rde_pilot_session")?.value;
}

export async function GET() {
  const sessionToken = await token();
  if (!sessionToken) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  const upstream = await fetch(`${apiBase}/v1/tenant/roblox/connections`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
    cache: "no-store",
  });
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT(request: NextRequest) {
  const sessionToken = await token();
  if (!sessionToken) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  const upstream = await fetch(`${apiBase}/v1/tenant/roblox/connection`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${sessionToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
    cache: "no-store",
  });
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
