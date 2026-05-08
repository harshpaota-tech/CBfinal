import { useState } from "react";
import { T } from "../App.jsx";
import Btn from "./ui/Btn.jsx";
import Badge from "./ui/Badge.jsx";
import { getFeatured, formatINR, formatUSD, BRAND, STATE_COUNT, CREDITS } from "../data/credits.js";

function MiniCard({ c, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#111d30" : "#0d1525",
        border: `1.5px solid ${hov ? c.color + "66" : "rgba(56,189,248,0.12)"}`,
        borderRadius: 20,
        padding: 24,
        cursor: "pointer",
        transition: "all .25s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <Badge color={c.color}>{c.type}</Badge>
        <span style={{ fontSize: 12, color: T.text3 }}>{c.flag} {c.state}</span>
      </div>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
      <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 8, lineHeight: 1.3 }}>{c.name}</h3>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: T.text2, padding: "2px 8px", borderRadius: 999, border: `1px solid ${T.border}` }}>{c.registry}</span>
        <span style={{ fontSize: 10, fontWeight: 600, color: T.text2, padding: "2px 8px", borderRadius: 999, border: `1px solid ${T.border}` }}>Vintage {c.vintage}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 900, color: T.green, lineHeight: 1 }}>
            {formatINR(c.price)}
            <span style={{ fontSize: 12, fontWeight: 400, color: T.text3 }}>/t</span>
          </div>
          <div style={{ fontSize: 10, color: T.text3, marginTop: 3 }}>{formatUSD(c.price)} USD</div>
        </div>
        <div style={{ fontSize: 11, color: T.text3, textAlign: "right" }}>{c.available.toLocaleString("en-IN")} left</div>
      </div>
    </div>
  );
}

export default function Home({ setPage }) {
  const featured = getFeatured();
  const stats = [
    { v: `${CREDITS.length}`, l: "Verified Projects" },
    { v: `${STATE_COUNT}`, l: "Indian States" },
    { v: "1,33,700+", l: "tCO₂e Available" },
    { v: "5", l: "Credit Types" },
  ];
  const steps = [
    { icon: "🔐", t: "Register & Verify", d: "Sign up and complete KYC in under 5 minutes." },
    { icon: "🔍", t: "Browse Projects", d: "Explore verified credits from Verra, CPCB EPR & SATAT-registered programs." },
    { icon: "💳", t: "Buy Credits", d: "Purchase any quantity in INR. Credits added to wallet instantly." },
    { icon: "📜", t: "Retire & Certify", d: "Retire credits and download your official certificate." },
  ];

  return (
    <div className="fade">
      <div style={{ minHeight: "88vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 24px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(14,165,233,0.12), transparent 65%)", pointerEvents: "none" }} />
        <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 24, padding: "7px 20px", marginBottom: 28, fontSize: 13, color: "#86efac", fontWeight: 600 }}>
          🇮🇳 By {BRAND.company}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#86efac", letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 18, maxWidth: 760, lineHeight: 1.5 }}>
          {BRAND.tagline}
        </div>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(38px,7vw,76px)", fontWeight: 900, lineHeight: 1.05, marginBottom: 24, maxWidth: 900 }}>
          Trade Verified <span style={{ background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Environmental Credits</span> with Confidence
        </h1>
        <p style={{ fontSize: 18, color: T.text2, maxWidth: 620, lineHeight: 1.75, marginBottom: 44 }}>
          India's first marketplace for buying, selling, and retiring verified environmental credits — built for CBG plant operators, FPOs, smallholder farmers, and ESG-driven enterprises.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <Btn size="lg" onClick={() => setPage("register")} style={{ boxShadow: "0 0 48px rgba(14,165,233,0.35)" }}>Start Offsetting Free →</Btn>
          <Btn size="lg" variant="outline" onClick={() => setPage("marketplace")}>Browse Credits</Btn>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 72, flexWrap: "wrap", justifyContent: "center" }}>
          {stats.map((s) => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px 32px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 28, fontWeight: 900, background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.v}</div>
              <div style={{ fontSize: 12, color: T.text3, marginTop: 4, fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: "16px 40px", background: T.bg1, display: "flex", alignItems: "center", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: T.text3, fontWeight: 700, textTransform: "uppercase" }}>Verified By</span>
        {["Verra VCS", "Verra W+", "CPCB EPR", "SATAT", "Gold Standard"].map((p) => (
          <span key={p} style={{ fontSize: 13, fontWeight: 700, color: T.text2, opacity: 0.7 }}>{p}</span>
        ))}
      </div>

      <div style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 36, fontWeight: 800, marginBottom: 10 }}>Offset in 4 Simple Steps</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 20, padding: 28, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -8, right: -8, fontFamily: "'Outfit',sans-serif", fontSize: 72, fontWeight: 900, color: "rgba(56,189,248,0.04)", lineHeight: 1 }}>{i + 1}</div>
              <div style={{ fontSize: 38, marginBottom: 14 }}>{s.icon}</div>
              <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{s.t}</h3>
              <p style={{ color: T.text2, fontSize: 14, lineHeight: 1.6 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      {featured.length > 0 && (
        <div style={{ padding: "60px 40px", background: T.bg1, borderTop: `1px solid ${T.border}` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
              <div>
                <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 30, fontWeight: 800, margin: 0 }}>Featured Projects</h2>
                <p style={{ color: T.text2, fontSize: 14, marginTop: 6 }}>Handpicked high-impact credits from Indian operators</p>
              </div>
              <Btn variant="outline" onClick={() => setPage("marketplace")}>View All →</Btn>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
              {featured.map((c) => <MiniCard key={c.id} c={c} onClick={() => setPage("marketplace")} />)}
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "80px 40px", textAlign: "center", background: `radial-gradient(ellipse 60% 80% at 50% 50%, rgba(14,165,233,0.07), transparent)` }}>
        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 40, fontWeight: 900, marginBottom: 14 }}>Ready to Make an Impact?</h2>
        <p style={{ color: T.text2, fontSize: 16, maxWidth: 520, margin: "0 auto 32px" }}>
          Join the FPOs, CBG plants, and enterprises building India's net-zero economy on Carbon Bridge.
        </p>
        <Btn size="lg" onClick={() => setPage("register")} style={{ boxShadow: "0 0 48px rgba(14,165,233,0.3)" }}>Create Free Account →</Btn>
      </div>
    </div>
  );
}
