import { NextRequest, NextResponse } from "next/server";

import { fetchAdminBackend, isAdminRequest } from "@/lib/admin-backend";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  try {
    const response = await fetchAdminBackend("/v1/admin/simulation/seed", { method: "POST" });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json({ detail: "Simulation backend unavailable." }, { status: 503 });
  }
}
