import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "rde_admin_session";
const SESSION_SECONDS = 60 * 60 * 12;

function safeEqual(left: string, right: string) {
  const leftDigest = createHmac("sha256", "rde-admin-compare").update(left).digest();
  const rightDigest = createHmac("sha256", "rde-admin-compare").update(right).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

export function adminAuthConfigured() {
  return Boolean(
    process.env.ADMIN_DASHBOARD_USERNAME &&
      process.env.ADMIN_DASHBOARD_PASSWORD &&
      process.env.ADMIN_SESSION_SECRET &&
      process.env.PILOT_ADMIN_TOKEN,
  );
}

export function validateAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_DASHBOARD_USERNAME ?? "";
  const expectedPassword = process.env.ADMIN_DASHBOARD_PASSWORD ?? "";
  if (!adminAuthConfigured()) return false;
  return safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export function createAdminSession() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = String(expires);
  const signature = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  return {
    value: `${payload}.${signature}`,
    maxAge: SESSION_SECONDS,
  };
}

export function verifyAdminSession(value: string | undefined) {
  if (!value || !adminAuthConfigured()) return false;
  const [expiresRaw, signature] = value.split(".");
  const expires = Number(expiresRaw);
  if (!expiresRaw || !signature || !Number.isFinite(expires)) return false;
  if (expires <= Math.floor(Date.now() / 1000)) return false;
  const expected = createHmac("sha256", sessionSecret()).update(expiresRaw).digest("hex");
  return safeEqual(signature, expected);
}
