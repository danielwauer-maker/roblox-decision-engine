import { NextRequest, NextResponse } from "next/server";

import { fetchAdminBackend, isAdminRequest } from "@/lib/admin-backend";

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!name || !slug || !email) {
    return NextResponse.json({ detail: "Name, slug and owner email are required." }, { status: 422 });
  }

  try {
    const organizationResponse = await fetchAdminBackend("/v1/tenant/admin/organizations", {
      method: "POST",
      body: JSON.stringify({ name, slug }),
    });
    const organization = await organizationResponse.json();
    if (!organizationResponse.ok) {
      return NextResponse.json(organization, { status: organizationResponse.status });
    }

    const inviteResponse = await fetchAdminBackend("/v1/tenant/admin/invites", {
      method: "POST",
      body: JSON.stringify({ organization_id: organization.id, email, role: "OWNER" }),
    });
    const invite = await inviteResponse.json();
    if (!inviteResponse.ok) {
      return NextResponse.json(
        { detail: "Studio created, but invite creation failed.", organization, invite_error: invite },
        { status: inviteResponse.status },
      );
    }

    const inviteUrl = `${request.nextUrl.origin}/app/login?token=${encodeURIComponent(invite.invite_token)}`;
    return NextResponse.json({ organization, invite_url: inviteUrl, expires_at: invite.expires_at });
  } catch {
    return NextResponse.json({ detail: "Admin API unavailable" }, { status: 503 });
  }
}
