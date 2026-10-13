import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const apiBase = process.env.API_BASE_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  const token = (await cookies()).get("rde_pilot_session")?.value;
  if (!token) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  const url = new URL(request.url);
  const days = url.searchParams.get("days") ?? "30";
  const upstream = await fetch(`${apiBase}/v1/tenant/roblox/sync?days=${encodeURIComponent(days)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const text = await upstream.text();

  if (!upstream.ok) {
    let detail = "Roblox analytics sync needs attention.";
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed.detail === "string") detail = parsed.detail;
    } catch {
      // Keep the generic safe customer-facing detail.
    }
    await fetch(`${apiBase}/v1/lifecycle/tenant/sync-attention`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ detail }),
      cache: "no-store",
    }).catch(() => undefined);
  }

  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
