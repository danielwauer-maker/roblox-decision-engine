import { NextRequest, NextResponse } from "next/server";

import { fetchAdminBackend, isAdminRequest } from "@/lib/admin-backend";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const organizationId = Number(body.organization_id);
  if (!Number.isInteger(organizationId) || organizationId <= 0) {
    return NextResponse.json({ detail: "Invalid organization id" }, { status: 422 });
  }
  try {
    const upstream = await fetchAdminBackend(`/v1/admin/organizations/${organizationId}/sessions/revoke`, {
      method: "POST",
    });
    const payload = await upstream.json().catch(() => ({ detail: "Invalid admin API response" }));
    return NextResponse.json(payload, { status: upstream.status });
  } catch {
    return NextResponse.json({ detail: "Admin API unavailable" }, { status: 503 });
  }
}
