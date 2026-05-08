import { T } from "../App.jsx";
import Btn from "./ui/Btn.jsx";
import { CONTACT } from "../data/credits.js";

export default function SellCredits({ setPage }) {
  const steps = [
    { n: 1, t: "Apply", b: "Submit project details, registry ID (Verra / Gold Standard / ACR), and methodology." },
    { n: 2, t: "Verify", b: "Our team reviews issuance, vintage, and additionality — typically within 5 business days." },
    { n: 3, t: "List", b: "Set your price and quantity. Your project goes live on the marketplace instantly." },
    { n: 4, t: "Settle", b: "Get paid in USD / EUR / INR within 3 days of each retirement. 5% platform fee." },
  ];

  return (
    <div className="fade" style={{ maxWidth: 1000, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(34px,5vw,52px)", fontWeight: 900, marginBottom: 14 }}>
          List Your <span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Carbon Project</span>
        </h1>
        <p style={{ color: T.text2, fontSize: 16, lineHeight: 1.7, maxWidth: 620, margin: "0 auto" }}>
          Reach 18,000+ buyers and 2,000+ companies actively retiring credits. List in 4 steps, keep 95% of every sale.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18, marginBottom: 52 }}>
        {steps.map((s) => (
          <div key={s.n} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, padding: 26, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -10, right: -6, fontFamily: "'Outfit',sans-serif", fontSize: 80, fontWeight: 900, color: "rgba(56,189,248,0.05)", lineHeight: 1 }}>{s.n}</div>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{s.t}</h3>
            <p style={{ color: T.text2, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{s.b}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 52 }}>
        {[
          { v: "5%", l: "Platform fee" },
          { v: "3 days", l: "Settlement" },
          { v: "2,300+", l: "Listed projects" },
          { v: "47", l: "Countries" },
        ].map((s) => (
          <div key={s.l} style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 16, padding: "22px 18px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 26, fontWeight: 900, background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.v}</div>
            <div style={{ fontSize: 12, color: T.text3, marginTop: 4, fontWeight: 500 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", padding: "44px 28px", background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 20 }}>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Ready to list your project?</h3>
        <p style={{ color: T.text2, fontSize: 14, marginBottom: 22 }}>Send us your registry ID and we'll get back within 1 business day.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href={`mailto:${CONTACT.email}?subject=CarbonBridge — Project listing application`} style={{ textDecoration: "none" }}>
            <Btn>Apply via email →</Btn>
          </a>
          <Btn variant="outline" onClick={() => setPage("howitworks")}>How It Works</Btn>
        </div>
      </div>
    </div>
  );
}
