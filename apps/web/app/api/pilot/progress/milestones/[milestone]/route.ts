import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const apiBase = process.env.API_BASE_URL ?? "http://localhost:8000";
const allowed = new Set(["priority_reviewed", "experiment_reviewed", "weekly_reviewed"]);

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ milestone: string }> },
) {
  const token = (await cookies()).get("rde_pilot_session")?.value;
  if (!token) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  const { milestone } = await context.params;
  if (!allowed.has(milestone)) return NextResponse.json({ detail: "Invalid milestone" }, { status: 422 });

  const upstream = await fetch(`${apiBase}/v1/tenant/progress/milestones/${milestone}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}
