import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_COOKIE_NAME,
  adminAuthConfigured,
  createAdminSession,
  validateAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!adminAuthConfigured()) {
    return NextResponse.json({ detail: "Admin login is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!validateAdminCredentials(username, password)) {
    return NextResponse.json({ detail: "Invalid credentials." }, { status: 401 });
  }

  const session = createAdminSession();
  const response = NextResponse.json({ status: "ok" });
  response.cookies.set(ADMIN_COOKIE_NAME, session.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: session.maxAge,
  });
  return response;
}
