import { NextRequest } from "next/server";

import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/admin-auth";

export function isAdminRequest(request: NextRequest) {
  return verifyAdminSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value);
}

export async function fetchAdminBackend(path: string, init: RequestInit = {}) {
  const apiBase = (process.env.API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");
  const adminToken = process.env.PILOT_ADMIN_TOKEN;
  if (!adminToken) {
    throw new Error("PILOT_ADMIN_TOKEN is not configured");
  }
  const headers = new Headers(init.headers);
  headers.set("X-Admin-Token", adminToken);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return fetch(`${apiBase}${path}`, { ...init, headers, cache: "no-store" });
}
