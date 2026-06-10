import { lazy, Suspense } from "react";
import { T } from "../theme.js";
import Btn from "./ui/Btn.jsx";
import VideoHero from "./VideoHero.jsx";
import ProgramsGrid from "./ProgramsGrid.jsx";
import ImpactBanner from "./ImpactBanner.jsx";
import ProjectShowcase from "./ProjectShowcase.jsx";
import NewsSection from "./NewsSection.jsx";
import { CREDITS, INDIA_DEMO_COUNT, INDIA_STATE_COUNT } from "../data/credits.js";
import { CTA_BANNER, bgImage } from "../data/media.js";

// Lazy-loaded: world-atlas topojson (~15 KB gz), d3-geo (~30 KB gz),
// react-simple-maps (~30 KB gz) split into their own chunk.
const WorldMap = lazy(() => import("./WorldMap.jsx"));

function WorldMapFallback() {
  return (
    <div style={{ minHeight: 460, display: "flex", alignItems: "center", justifyContent: "center", color: T.text3, fontSize: 13 }}>
      Loading map…
    </div>
  );
}

export default function Home({ setPage }) {
  const stats = [
    { v: "4,800+",   l: "SATAT CBG Plants Targetable" },
    { v: "₹8,400 Cr", l: "India Carbon Market 2025" },
    { v: "50M+",     l: "Farmers Addressable" },
    { v: "18,000",   l: "tCO₂e Per CBG Plant/Year" },
  ];
  const steps = [
    { icon: "🔐", t: "Register & Verify", d: "Sign up and complete KYC in under 5 minutes." },
    { icon: "🔍", t: "Browse Projects",   d: "Explore verified credits from Verra, CPCB EPR & SATAT-registered programs." },
    { icon: "💳", t: "Buy Credits",       d: "Purchase any quantity in INR. Credits added to wallet instantly." },
    { icon: "📜", t: "Retire & Certify",  d: "Retire credits and download your official certificate." },
  ];

  return (
    <div className="fade">
      {/* 1. Hero with autoplay nature video background */}
      <VideoHero setPage={setPage} stats={stats} />

      {/* 2. Trust badges row */}
      <div style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: "16px 40px", background: T.bg1, display: "flex", alignItems: "center", justifyContent: "center", gap: 40, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: T.text3, fontWeight: 700, textTransform: "uppercase" }}>Verified By</span>
        {["Verra VCS", "Verra W+", "CPCB EPR", "SATAT", "Gold Standard"].map((p) => (
          <span key={p} style={{ fontSize: 13, fontWeight: 700, color: T.text2, opacity: 0.7 }}>{p}</span>
        ))}
      </div>

      {/* 3. Programs grid with photos (Verra-style "Our Programs") */}
      <ProgramsGrid setPage={setPage} />

      {/* 4. Full-width impact banner (Verra-style headline overlay) */}
      <ImpactBanner setPage={setPage} />

      {/* 5. World map */}
      <Suspense fallback={<WorldMapFallback />}>
        <WorldMap onPinClick={() => setPage("marketplace")} />
      </Suspense>

      {/* 6. 4-step explainer */}
      <div style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#86efac", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Get Started</div>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 36, fontWeight: 800, margin: 0 }}>Offset in 4 Simple Steps</h2>
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

      {/* 7. Photo-led featured projects */}
      <ProjectShowcase setPage={setPage} />

      {/* 8. News & insights */}
      <NewsSection />

      {/* 9. Big closing CTA with photo background */}
      <section style={{ position: "relative", padding: "120px 24px", textAlign: "center", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, ...bgImage(CTA_BANNER) }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,8,15,0.55) 0%, rgba(4,8,15,0.85) 100%), radial-gradient(ellipse 60% 80% at 50% 50%, rgba(34,197,94,0.18), transparent 60%)" }} />
        <div style={{ position: "relative", maxWidth: 680, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(32px,5vw,46px)", fontWeight: 900, marginBottom: 14, color: "#fff", textShadow: "0 4px 20px rgba(0,0,0,0.6)" }}>
            Ready to Make an Impact?
          </h2>
          <p style={{ color: "#dbeafe", fontSize: 17, lineHeight: 1.7, maxWidth: 520, margin: "0 auto 32px", textShadow: "0 2px 14px rgba(0,0,0,0.5)" }}>
            Join the FPOs, CBG plants, and enterprises building India's net-zero economy on Carbon Bridge.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn size="lg" onClick={() => setPage("register")} style={{ boxShadow: "0 0 48px rgba(34,197,94,0.4)" }}>Create Free Account →</Btn>
            <Btn size="lg" variant="outline" onClick={() => setPage("marketplace")}>Browse {CREDITS.length} Demo Listings</Btn>
          </div>
          <div style={{ marginTop: 20, fontSize: 12, color: "#cbd5e1" }}>
            {INDIA_DEMO_COUNT} demo India listings · {INDIA_STATE_COUNT} states · no real projects listed yet
          </div>
        </div>
      </section>
    </div>
  );
}
