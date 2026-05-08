import { T } from "../App.jsx";
import Btn from "./ui/Btn.jsx";
import { CONTACT } from "../data/credits.js";

export default function ForBusiness({ setPage }) {
  const offers = [
    { icon: "📊", t: "ESG-ready reporting", b: "Quarterly and annual reports formatted for CSRD, GRI, and SASB disclosures — ready to drop into your sustainability report." },
    { icon: "💼", t: "Volume pricing", b: "Bulk discounts kick in from 1,000 tonnes. Custom contracts and multi-year forward agreements available for net-zero pledges." },
    { icon: "🧾", t: "Invoicing & procurement", b: "PO-friendly invoicing, GST-compliant billing for India, and multi-currency settlement (USD, EUR, INR)." },
    { icon: "🏛️", t: "Registry-grade retirements", b: "Every credit retired on Verra, Gold Standard, or ACR with a public retirement record and a branded certificate for stakeholders." },
  ];

  return (
    <div className="fade" style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(34px,5vw,52px)", fontWeight: 900, marginBottom: 14 }}>
          CarbonBridge for <span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Business</span>
        </h1>
        <p style={{ color: T.text2, fontSize: 16, lineHeight: 1.7, maxWidth: 640, margin: "0 auto" }}>
          From climate-conscious startups to listed corporates — buy, retire, and report verified carbon credits at scale, with the audit trail your CFO and CSO will both sign off on.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, marginBottom: 56 }}>
        {offers.map((o, i) => (
          <div key={i} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, padding: 26 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>{o.icon}</div>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{o.t}</h3>
            <p style={{ color: T.text2, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{o.b}</p>
          </div>
        ))}
      </div>

      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 22, padding: "40px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Talk to our team</h2>
          <p style={{ color: T.text2, fontSize: 14, margin: 0 }}>We'll come back to you within 1 business day.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18, marginBottom: 28 }}>
          <ContactCard icon="👤" label="Founder" value={CONTACT.founder} />
          <ContactCard icon="✉️" label="Email" value={CONTACT.email} href={`mailto:${CONTACT.email}`} />
          <ContactCard icon="📞" label="Phone" value={CONTACT.phone} href={`tel:${CONTACT.phoneRaw}`} />
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={`mailto:${CONTACT.email}?subject=CarbonBridge — Business inquiry`} style={{ textDecoration: "none" }}>
            <Btn>Email {CONTACT.founder.split(" ")[0]} →</Btn>
          </a>
          <Btn variant="outline" onClick={() => setPage("marketplace")}>Browse marketplace</Btn>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon, label, value, href }) {
  const inner = (
    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: "18px 20px", height: "100%" }}>
      <div style={{ fontSize: 11, color: T.text3, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
        <span style={{ marginRight: 6 }}>{icon}</span>{label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: T.text1, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
  return href ? <a href={href} style={{ textDecoration: "none", color: "inherit" }}>{inner}</a> : inner;
}
