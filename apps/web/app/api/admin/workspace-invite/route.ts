import { NextRequest, NextResponse } from "next/server";

import { fetchAdminBackend, isAdminRequest } from "@/lib/admin-backend";

function publicOrigin(request: NextRequest) {
  const configured = (process.env.PUBLIC_APP_URL ?? "").trim().replace(/\/$/, "");
  if (configured) return configured;

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) return `${forwardedProto ?? "https"}://${forwardedHost}`;
  return request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const organizationId = Number(body.organization_id);
  if (!Number.isInteger(organizationId) || organizationId <= 0) {
    return NextResponse.json({ detail: "Valid organization_id is required." }, { status: 422 });
  }

  try {
    const overviewResponse = await fetchAdminBackend("/v1/admin/overview", { method: "GET" });
    const overview = await overviewResponse.json();
    if (!overviewResponse.ok) {
      return NextResponse.json(overview, { status: overviewResponse.status });
    }

    const invites = Array.isArray(overview.recent_invites) ? overview.recent_invites : [];
    const sourceInvite = invites.find(
      (invite: { organization_id?: number; role?: string; email?: string }) =>
        invite.organization_id === organizationId && invite.role === "OWNER" && typeof invite.email === "string",
    );

    if (!sourceInvite?.email) {
      return NextResponse.json(
        { detail: "No owner email is available for this studio. Create a new owner invite from onboarding first." },
        { status: 409 },
      );
    }

    const inviteResponse = await fetchAdminBackend("/v1/tenant/admin/invites", {
      method: "POST",
      body: JSON.stringify({ organization_id: organizationId, email: sourceInvite.email, role: "OWNER" }),
    });
    const invite = await inviteResponse.json();
    if (!inviteResponse.ok) {
      return NextResponse.json(invite, { status: inviteResponse.status });
    }

    const inviteUrl = `${publicOrigin(request)}/app/login?token=${encodeURIComponent(invite.invite_token)}`;
    return NextResponse.json({
      invite_url: inviteUrl,
      expires_at: invite.expires_at,
      email: sourceInvite.email,
      organization_id: organizationId,
    });
  } catch {
    return NextResponse.json({ detail: "Admin API unavailable" }, { status: 503 });
  }
}
