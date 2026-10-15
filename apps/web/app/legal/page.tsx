import type { Metadata } from "next";
import { LegalBody, LegalSection, LegalShell } from "../_components/legal-shell";

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

  const toc = [
    { id: "operator", label: "Operator" },
    { id: "contact", label: "Contact" },
    ...(additional ? [{ id: "additional", label: "Additional information" }] : []),
  ];

  return (
    <LegalShell eyebrow="Legal" title="Legal notice" intro="Operator and contact information for PlayDirective." updated="Last updated · 13 Oct 2026">
      <LegalBody
        toc={toc}
        highlights={[
          { label: "Service", text: "PlayDirective is currently operated as an early-access founding-studio service." },
          { label: "Contact", text: "The production contact address is configured server-side and published here." },
          { label: "Privacy", text: "Privacy and service information is linked throughout the public site." },
        ]}
      >
        {!complete && (
          <div className="notice">Legal notice configuration is incomplete. Operator name, full postal address and a working contact email must be configured on the production server before commercial public launch.</div>
        )}

        <LegalSection id="operator" title="Operator">
          <div>{operator || "Not configured"}</div>
          <div>{street || "Street address not configured"}</div>
          <div>{postalCity || "Postal code and city not configured"}</div>
          <div>{country || "Country not configured"}</div>
        </LegalSection>

        <LegalSection id="contact" title="Contact">
          Email: {email ? <a href={`mailto:${email}`} style={{ color: "#59e6ff" }}>{email}</a> : "Not configured"}
        </LegalSection>

        {additional && (
          <LegalSection id="additional" title="Additional information">
            <div style={{ whiteSpace: "pre-line" }}>{additional}</div>
          </LegalSection>
        )}
      </LegalBody>
    </LegalShell>
  );
}
