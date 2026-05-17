import { useTranslation } from "react-i18next";
import { T } from "../theme.js";
import Btn from "./ui/Btn.jsx";
import { BRAND } from "../data/credits.js";
import { HERO_MEDIA, bgImage } from "../data/media.js";

/**
 * Cinematic hero with a slow Ken Burns animation over a high-resolution
 * rainforest aerial photo. Gives the "moving image" feel without the
 * fragility of a hotlinked stock video (Pexels CDN blocks hotlinks; Coverr
 * URLs change without warning). One self-hosted image, no network surprises.
 *
 * If the user has prefers-reduced-motion on, the animation pauses and the
 * background stays still.
 */
export default function VideoHero({ setPage, stats }) {
  const { t } = useTranslation();

  return (
    <section
      style={{
        position: "relative",
        minHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "80px 24px 60px",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes cb-hero-ken-burns {
          0%   { transform: scale(1.05) translate(0,0); }
          50%  { transform: scale(1.18) translate(-1.5%,-1.5%); }
          100% { transform: scale(1.05) translate(0,0); }
        }
        .cb-hero-bg {
          animation: cb-hero-ken-burns 32s ease-in-out infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .cb-hero-bg { animation: none; transform: scale(1.05); }
        }
        @keyframes cb-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
      `}</style>

      {/* Background photo with Ken Burns */}
      <div
        aria-hidden="true"
        className="cb-hero-bg"
        style={{
          position: "absolute",
          inset: -60,
          ...bgImage(HERO_MEDIA.poster),
          zIndex: 0,
        }}
      />

      {/* Dark gradient + brand-green wash for legibility */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none",
        background: `
          linear-gradient(180deg, rgba(4,8,15,0.45) 0%, rgba(4,8,15,0.65) 50%, rgba(4,8,15,0.92) 100%),
          radial-gradient(ellipse 80% 60% at 50% 30%, rgba(34,197,94,0.18), transparent 65%)
        `,
      }} />

      <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 24, padding: "7px 18px", marginBottom: 26, fontSize: 12, color: "#86efac", fontWeight: 700, letterSpacing: 0.5, backdropFilter: "blur(8px)" }}>
          🇮🇳 By {BRAND.company}
        </div>

        <h1 style={{
          fontFamily: "'Outfit',sans-serif",
          fontSize: "clamp(40px,7.5vw,84px)",
          fontWeight: 900,
          lineHeight: 1.02,
          marginBottom: 24,
          maxWidth: 960,
          textShadow: "0 4px 30px rgba(0,0,0,0.5)",
          color: "#ffffff",
        }}>
          {t("home.hero")}
        </h1>

        <p style={{
          fontSize: 19,
          color: "#dbeafe",
          maxWidth: 660,
          lineHeight: 1.7,
          marginBottom: 44,
          textShadow: "0 2px 14px rgba(0,0,0,0.5)",
        }}>
          {t("home.subhero")}
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 64 }}>
          <Btn size="lg" onClick={() => setPage("marketplace")} style={{ boxShadow: "0 0 48px rgba(34,197,94,0.45)" }}>{t("home.buyCredits")} →</Btn>
          <Btn size="lg" variant="outline" onClick={() => setPage("sell")}>{t("home.sellCredits")}</Btn>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, width: "100%", maxWidth: 880 }}>
          {stats.map((s) => (
            <div key={s.l} style={{
              background: "rgba(13,21,37,0.55)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: 18,
              padding: "20px 22px",
              textAlign: "center",
            }}>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 28, fontWeight: 900, background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.v}</div>
              <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 6, fontWeight: 600, letterSpacing: 0.4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: -36, left: "50%", transform: "translateX(-50%)", color: "#86efac", fontSize: 11, letterSpacing: 2, fontWeight: 700, opacity: 0.7, display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <span>SCROLL</span>
          <span style={{ animation: "cb-bounce 1.6s ease-in-out infinite" }}>↓</span>
        </div>
      </div>
    </section>
  );
}
