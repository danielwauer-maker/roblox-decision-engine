import { NextRequest, NextResponse } from "next/server";

const apiBase = process.env.API_BASE_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  const upstream = await fetch(`${apiBase}/v1/enrollment/standard-trial-signups/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await request.text(),
    cache: "no-store",
  });
  const payload = await upstream.json();
  if (!upstream.ok) return NextResponse.json(payload, { status: upstream.status });
  const response = NextResponse.json({ organization: payload.organization, user: payload.user, start_trial_checkout: payload.start_trial_checkout });
  response.cookies.set("rde_pilot_session", payload.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 35,
  });
  return response;
}
