import type { MetadataRoute } from "next";

const baseUrl = "https://roblox-decision-engine.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/pricing",
    "/demo",
    "/demo/priorities",
    "/demo/investigation",
    "/demo/experiment",
    "/demo/report",
    "/demo/analyst",
    "/demo/pilot",
    "/portfolio",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date("2026-10-12"),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/pricing" ? 0.9 : 0.7,
  }));
}
