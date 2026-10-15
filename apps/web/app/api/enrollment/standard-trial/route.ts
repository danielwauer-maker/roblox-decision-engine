import { NextRequest, NextResponse } from "next/server";

const apiBase = process.env.API_BASE_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  const upstream = await fetch(`${apiBase}/v1/enrollment/standard-trial-signups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await request.text(),
    cache: "no-store",
  });
  return new NextResponse(await upstream.text(), { status: upstream.status, headers: { "Content-Type": "application/json" } });
}
