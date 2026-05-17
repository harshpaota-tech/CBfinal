import { T } from "../theme.js";
import Btn from "./ui/Btn.jsx";
import PageBanner from "./ui/PageBanner.jsx";
import { PAGE_BANNERS } from "../data/media.js";
import { formatINR, formatUSD, CREDITS } from "../data/credits.js";

const cheapest = Math.min(...CREDITS.map((c) => c.price));

export default function HowItWorks({ setPage }) {
  const items = [
    {
      icon: "🌿",
      t: "What is an Environmental Credit?",
      b: "One credit = one tonne of CO₂ avoided/removed (or one tonne of plastic recovered). Buying and retiring a credit compensates for your own emissions or waste footprint, lowering your net environmental impact.",
    },
    {
      icon: "✅",
      t: "How Are Credits Verified?",
      b: "Every credit is registered on Verra (VCS), Verra W+, Gold Standard, or India's CPCB EPR registry. Independent auditors verify that reductions are real, measurable, permanent, and additional.",
    },
    {
      icon: "👤",
      t: "Can Individuals Buy Credits?",
      b: `Yes — no legal restrictions. You can offset a flight, your annual footprint, or a special event. Starting from ${formatINR(cheapest)} (${formatUSD(cheapest)} USD) per tonne CO₂e.`,
    },
    {
      icon: "🌾",
      t: "Built for India",
      b: "Carbon Bridge specialises in India-specific credit types: SATAT-registered CBG plants, FPO agroforestry, regenerative soil carbon, ocean plastic, biomass pellets, EPR plastic, and Sundarban blue carbon — aggregated under Programmes of Activity to make registration affordable for smallholders.",
    },
    {
      icon: "🔁",
      t: "What Does Retirement Mean?",
      b: "Retiring permanently removes a credit from circulation. No one else can claim it. You receive a certificate and the retirement is recorded on the public registry.",
    },
    {
      icon: "🏢",
      t: "For Businesses",
      b: "Use credits for ESG reporting, net-zero pledges, EPR compliance under India's Plastic Waste Management Rules 2022, and stakeholder communication. Carbon Bridge provides bulk pricing in INR, GST invoicing, and ESG-ready reports.",
    },
  ];

  return (
    <div className="fade">
      <PageBanner
        tag="Guide"
        title="How It Works"
        subtitle="Everything about buying, selling, and retiring environmental credits in India."
        photo={PAGE_BANNERS.howitworks}
        height={300}
      />
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "50px 24px 60px" }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: 22, marginBottom: 22, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, padding: 26 }}>
          <div style={{ fontSize: 36, flexShrink: 0 }}>{item.icon}</div>
          <div>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{item.t}</h3>
            <p style={{ color: T.text2, fontSize: 14, lineHeight: 1.75 }}>{item.b}</p>
          </div>
        </div>
      ))}
      <div style={{ textAlign: "center", marginTop: 44, display: "flex", gap: 12, justifyContent: "center" }}>
        <Btn onClick={() => setPage("register")}>Create Account →</Btn>
        <Btn variant="outline" onClick={() => setPage("marketplace")}>Browse Credits</Btn>
      </div>
      </div>
    </div>
  );
}
