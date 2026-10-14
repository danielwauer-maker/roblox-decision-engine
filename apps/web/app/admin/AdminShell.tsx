"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="admin-shell-root" style={{ minHeight: "100vh", background: "#06111f", color: "#edf6ff", fontFamily: "Arial, sans-serif" }}>
      <div className="admin-mobile-bar">
        <Link href="/admin/overview" className="admin-mobile-brand">PlayDirective · Admin</Link>
        <button className="admin-menu-button" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Open admin navigation">
          {menuOpen ? "×" : "☰"}
        </button>
      </div>

      {menuOpen && <button className="admin-menu-backdrop" type="button" aria-label="Close admin navigation" onClick={() => setMenuOpen(false)} />}

      <div className="admin-layout" style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(220px, 260px) 1fr" }}>
        <aside className={`admin-sidebar ${menuOpen ? "admin-sidebar-open" : ""}`} style={{ borderRight: "1px solid rgba(255,255,255,.08)", background: "#07101d", padding: "24px 18px", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
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
                      <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", color: active ? "#07101f" : "#c7d5e5", background: active ? "#67e8f9" : "transparent", border: active ? "1px solid #67e8f9" : "1px solid transparent", borderRadius: 10, padding: "10px 11px", fontSize: 13, fontWeight: active ? 800 : 600 }}>
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
        <div className="admin-content" style={{ minWidth: 0 }}>
          <main className="admin-main" style={{ maxWidth: 1500, margin: "0 auto", padding: "30px clamp(20px, 4vw, 48px) 72px" }}>{children}</main>
        </div>
      </div>

      <style jsx global>{`
        .admin-mobile-bar,
        .admin-menu-backdrop { display: none; }

        @media (max-width: 900px) {
          body { overflow-x: hidden; }
          .admin-layout { display: block !important; min-height: 100vh !important; }
          .admin-mobile-bar {
            position: sticky;
            top: 0;
            z-index: 55;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            min-height: 58px;
            padding: 10px 14px;
            background: rgba(7,16,29,.97);
            border-bottom: 1px solid rgba(255,255,255,.08);
            backdrop-filter: blur(12px);
          }
          .admin-mobile-brand {
            color: #a5f3fc;
            text-decoration: none;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: .08em;
            text-transform: uppercase;
          }
          .admin-menu-button {
            width: 42px;
            height: 42px;
            border-radius: 11px;
            border: 1px solid rgba(255,255,255,.13);
            background: #0b1727;
            color: #eef7ff;
            font-size: 22px;
            line-height: 1;
          }
          .admin-menu-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 58;
            border: 0;
            background: rgba(1,7,15,.64);
          }
          .admin-sidebar {
            position: fixed !important;
            z-index: 60;
            top: 0 !important;
            left: 0;
            width: min(84vw, 320px);
            max-width: 320px;
            height: 100dvh !important;
            box-sizing: border-box;
            transform: translateX(-105%);
            transition: transform .2s ease;
            box-shadow: 20px 0 50px rgba(0,0,0,.35);
          }
          .admin-sidebar-open { transform: translateX(0); }
          .admin-content { width: 100%; min-width: 0 !important; }
          .admin-main {
            width: 100%;
            max-width: 100% !important;
            box-sizing: border-box;
            padding: 22px 14px 58px !important;
          }
          .admin-main * { box-sizing: border-box; }
          .admin-main > * { min-width: 0; max-width: 100%; }
          .admin-main section,
          .admin-main article,
          .admin-main div { min-width: 0; }
          .admin-main [style*="grid-template-columns"] {
            grid-template-columns: minmax(0, 1fr) !important;
          }
          .admin-main [style*="minmax("] { min-width: 0 !important; }
          .admin-main h1 {
            font-size: clamp(30px, 10vw, 44px) !important;
            line-height: 1.04 !important;
            overflow-wrap: anywhere;
          }
          .admin-main h2,
          .admin-main h3,
          .admin-main p,
          .admin-main span,
          .admin-main code { overflow-wrap: anywhere; }
          .admin-main input,
          .admin-main textarea,
          .admin-main select,
          .admin-main button { max-width: 100%; }
          .admin-main table {
            display: block;
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }

        @media (max-width: 480px) {
          .admin-main { padding-left: 12px !important; padding-right: 12px !important; }
          .admin-main article,
          .admin-main section { border-radius: 14px !important; }
        }
      `}</style>
    </div>
  );
}
