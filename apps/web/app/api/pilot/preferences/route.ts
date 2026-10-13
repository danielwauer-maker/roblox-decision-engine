import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const apiBase = process.env.API_BASE_URL ?? "http://localhost:8000";

async function token() {
  return (await cookies()).get("rde_pilot_session")?.value;
}

export async function GET() {
  const session = await token();
  if (!session) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  const upstream = await fetch(`${apiBase}/v1/lifecycle/tenant/preferences`, {
    headers: { Authorization: `Bearer ${session}` },
    cache: "no-store",
  });
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT(request: NextRequest) {
  const session = await token();
  if (!session) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  const upstream = await fetch(`${apiBase}/v1/lifecycle/tenant/preferences`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${session}`, "Content-Type": "application/json" },
    body: await request.text(),
    cache: "no-store",
  });
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
