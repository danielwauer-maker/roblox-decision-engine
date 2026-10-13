import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal notice",
  description: "Legal notice and operator information for PlayDirective.",
};

export const dynamic = "force-dynamic";

function value(name: string) {
  return (process.env[name] ?? "").trim();
}

export default function LegalPage() {
  const operator = value("LEGAL_OPERATOR_NAME");
  const street = value("LEGAL_STREET_ADDRESS");
  const postalCity = value("LEGAL_POSTAL_CITY");
  const country = value("LEGAL_COUNTRY");
  const email = value("LEGAL_EMAIL");
  const additional = value("LEGAL_ADDITIONAL_DETAILS");
  const complete = Boolean(operator && street && postalCity && country && email);

  return (
    <main style={{ minHeight: "100vh", background: "#07101f", color: "#eef7ff", fontFamily: "Arial, sans-serif" }}>
      <section style={{ maxWidth: 820, margin: "0 auto", padding: "72px clamp(20px,5vw,24px) 90px" }}>
        <a href="/" style={{ color: "#67e8f9", textDecoration: "none", fontSize: 14 }}>← PlayDirective</a>
        <div style={{ marginTop: 34, color: "#67e8f9", fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase" }}>Legal</div>
        <h1 style={{ margin: "14px 0 0", fontSize: "clamp(40px,8vw,58px)", letterSpacing: "-.05em" }}>Legal notice</h1>
        <p style={{ color: "#9fb1c7", lineHeight: 1.75, fontSize: 17 }}>Operator and contact information for PlayDirective.</p>

        {!complete && (
          <div style={{ marginTop: 28, border: "1px solid rgba(251,113,133,.35)", background: "rgba(251,113,133,.06)", color: "#fecdd3", borderRadius: 16, padding: 18, lineHeight: 1.65 }}>
            Legal notice configuration is incomplete. Operator name, full postal address and a working contact email must be configured on the production server before commercial public launch.
          </div>
        )}

        <section style={{ marginTop: 34, borderTop: "1px solid rgba(255,255,255,.09)", paddingTop: 24 }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Operator</h2>
          <div style={{ marginTop: 12, color: "#9fb1c7", lineHeight: 1.8 }}>
            <div>{operator || "Not configured"}</div>
            <div>{street || "Street address not configured"}</div>
            <div>{postalCity || "Postal code and city not configured"}</div>
            <div>{country || "Country not configured"}</div>
          </div>
        </section>

        <section style={{ marginTop: 34, borderTop: "1px solid rgba(255,255,255,.09)", paddingTop: 24 }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Contact</h2>
          <p style={{ margin: "10px 0 0", color: "#9fb1c7", lineHeight: 1.75 }}>
            Email: {email ? <a href={`mailto:${email}`} style={{ color: "#67e8f9" }}>{email}</a> : "Not configured"}
          </p>
        </section>

        {additional && (
          <section style={{ marginTop: 34, borderTop: "1px solid rgba(255,255,255,.09)", paddingTop: 24 }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>Additional information</h2>
            <p style={{ margin: "10px 0 0", color: "#9fb1c7", lineHeight: 1.75, whiteSpace: "pre-line" }}>{additional}</p>
          </section>
        )}

        <p style={{ marginTop: 38, color: "#718198", fontSize: 12, lineHeight: 1.6 }}>Last updated: 13 October 2026.</p>
      </section>
    </main>
  );
}
