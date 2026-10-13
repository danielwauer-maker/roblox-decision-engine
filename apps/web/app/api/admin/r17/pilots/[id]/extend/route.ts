import { NextRequest, NextResponse } from "next/server";

import { fetchAdminBackend, isAdminRequest } from "@/lib/admin-backend";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const organizationId = Number(id);
  if (!Number.isInteger(organizationId) || organizationId <= 0) {
    return NextResponse.json({ detail: "Invalid organization id" }, { status: 422 });
  }
  const body = await request.json().catch(() => ({ days: 7 }));
  try {
    const upstream = await fetchAdminBackend(`/v1/r17/admin/pilot/${organizationId}/extend`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ detail: "Admin API unavailable" }, { status: 503 });
  }
}
