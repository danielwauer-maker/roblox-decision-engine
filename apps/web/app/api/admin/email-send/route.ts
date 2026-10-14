import { NextRequest, NextResponse } from "next/server";

import { fetchAdminBackend, isAdminRequest } from "@/lib/admin-backend";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const body = await request.text();
  try {
    const upstream = await fetchAdminBackend("/v1/admin/communications/email-send", { method: "POST", body });
    return new NextResponse(await upstream.text(), { status: upstream.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Admin API unavailable" }, { status: 503 });
  }
}
