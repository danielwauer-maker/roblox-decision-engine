import { NextRequest, NextResponse } from "next/server";

import { fetchAdminBackend, isAdminRequest } from "@/lib/admin-backend";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest(request)) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const applicationId = Number(id);
  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    return NextResponse.json({ detail: "Invalid application id" }, { status: 422 });
  }
  const body = await request.json().catch(() => ({}));
  try {
    const upstream = await fetchAdminBackend(`/v1/enrollment/admin/applications/${applicationId}/review`, {
      method: "PUT",
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
