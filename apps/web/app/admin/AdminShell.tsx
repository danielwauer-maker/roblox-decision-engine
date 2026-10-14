"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const groups = [
  {
    label: "Operations",
    items: [
      ["Overview", "/admin/overview"],
      ["Applications", "/admin/applications"],
      ["Studios & customers", "/admin/studios"],
    ],
  },
  {
    label: "Customer success",
    items: [
      ["Pilot operations", "/admin/pilot-ops"],
      ["Billing", "/admin/billing"],
      ["Workspace access", "/admin/access"],
      ["Email templates", "/admin/email-templates"],
    ],
  },
  {
    label: "System",
    items: [
      ["Data & simulation", "/admin/data"],
      ["Build log", "/admin/build-log"],
    ],
  },
] as const;

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div style={{ minHeight: "100vh", background: "#06111f", color: "#edf6ff", fontFamily: "Arial, sans-serif" }}>
      <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(220px, 260px) 1fr" }}>
        <aside style={{ borderRight: "1px solid rgba(255,255,255,.08)", background: "#07101d", padding: "24px 18px", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
          <Link href="/admin/overview" style={{ color: "inherit", textDecoration: "none" }}>
            <div style={{ color: "#67e8f9", fontSize: 10, fontWeight: 900, letterSpacing: ".17em", textTransform: "uppercase" }}>PlayDirective · Private</div>
            <div style={{ marginTop: 7, fontSize: 22, fontWeight: 900, letterSpacing: "-.03em" }}>Operator Console</div>
          </Link>
          <div style={{ marginTop: 28, display: "grid", gap: 24 }}>
            {groups.map((group) => (
              <div key={group.label}>
                <div style={{ color: "#60738c", fontSize: 9, fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase", padding: "0 10px 7px" }}>{group.label}</div>
                <div style={{ display: "grid", gap: 4 }}>
                  {group.items.map(([label, href]) => {
                    const active = pathname === href || pathname.startsWith(href + "/");
                    return (
                      <Link key={href} href={href} style={{ textDecoration: "none", color: active ? "#07101f" : "#c7d5e5", background: active ? "#67e8f9" : "transparent", border: active ? "1px solid #67e8f9" : "1px solid transparent", borderRadius: 10, padding: "10px 11px", fontSize: 13, fontWeight: active ? 800 : 600 }}>
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.08)" }}>
            <Link href="/" style={{ display: "block", color: "#8da3bb", textDecoration: "none", padding: "9px 10px", fontSize: 12 }}>Public site ↗</Link>
            <button onClick={() => void logout()} style={{ width: "100%", marginTop: 4, textAlign: "left", border: "1px solid rgba(251,113,133,.18)", background: "rgba(251,113,133,.05)", color: "#fda4af", borderRadius: 9, padding: "9px 10px", cursor: "pointer", fontSize: 12 }}>Sign out</button>
          </div>
        </aside>
        <div style={{ minWidth: 0 }}>
          <main style={{ maxWidth: 1500, margin: "0 auto", padding: "30px clamp(20px, 4vw, 48px) 72px" }}>{children}</main>
        </div>
      </div>
      <style jsx global>{`
        @media (max-width: 860px) {
          body > div > div > div { min-width: 0; }
        }
        @media (max-width: 760px) {
          body { overflow-x: hidden; }
        }
      `}</style>
    </div>
  );
}
