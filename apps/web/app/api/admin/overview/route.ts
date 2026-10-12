import { NextRequest, NextResponse } from "next/server";

import { fetchAdminBackend, isAdminRequest } from "@/lib/admin-backend";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  try {
    const upstream = await fetchAdminBackend("/v1/admin/overview");
    const payload = await upstream.json().catch(() => ({ detail: "Invalid admin API response" }));
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json({ detail: "Admin API unavailable" }, { status: 503 });
  }
}
