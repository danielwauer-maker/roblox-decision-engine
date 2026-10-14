import { NextRequest, NextResponse } from "next/server";

import { fetchAdminBackend, isAdminRequest } from "@/lib/admin-backend";

export async function PUT(request: NextRequest, context: { params: Promise<{ key: string }> }) {
  if (!isAdminRequest(request)) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { key } = await context.params;
  const body = await request.text();
  try {
    const upstream = await fetchAdminBackend(`/v1/admin/communications/email-templates/${encodeURIComponent(key)}`, { method: "PUT", body });
    return new NextResponse(await upstream.text(), { status: upstream.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ detail: "Admin API unavailable" }, { status: 503 });
  }
}
