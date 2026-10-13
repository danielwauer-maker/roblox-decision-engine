import type { MetadataRoute } from "next";

const baseUrl = "https://playdirective.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/pricing",
    "/demo",
    "/demo/connect",
    "/demo/priorities",
    "/demo/investigation",
    "/demo/experiment",
    "/demo/report",
    "/demo/analyst",
    "/demo/pilot",
    "/privacy",
    "/terms",
    "/legal",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date("2026-10-13"),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/pricing" ? 0.9 : path.startsWith("/demo") ? 0.8 : 0.6,
  }));
}
