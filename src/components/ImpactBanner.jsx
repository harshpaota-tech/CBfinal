import { T } from "../theme.js";
import Btn from "./ui/Btn.jsx";
import { IMPACT_BANNER, bgImage } from "../data/media.js";

/**
 * Verra-style full-bleed impact banner with overlay headline + CTA.
 * Uses a slow Ken Burns zoom to add subtle motion without needing a video.
 */
export default function ImpactBanner({ setPage }) {
  return (
    <section style={{ position: "relative", minHeight: 460, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px", overflow: "hidden" }}>
      <style>{`
        @keyframes cb-ken-burns {
          0%   { transform: scale(1.04) translate(0,0); }
          50%  { transform: scale(1.12) translate(-1%,-1%); }
          100% { transform: scale(1.04) translate(0,0); }
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: -40,
          animation: "cb-ken-burns 24s ease-in-out infinite",
          willChange: "transform",
          ...bgImage(IMPACT_BANNER),
        }}
      />

      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,8,15,0.45) 0%, rgba(4,8,15,0.7) 100%), linear-gradient(90deg, rgba(34,197,94,0.18) 0%, transparent 60%)" }} />

      <div style={{ position: "relative", maxWidth: 880 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#86efac", letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>Impact</div>
        <h2 style={{
          fontFamily: "'Outfit',sans-serif",
          fontSize: "clamp(30px,5.5vw,58px)",
          fontWeight: 900,
          lineHeight: 1.05,
          marginBottom: 18,
          color: "#ffffff",
          textShadow: "0 4px 30px rgba(0,0,0,0.5)",
          letterSpacing: -0.5,
        }}>
          LEARN ABOUT CARBON BRIDGE PROJECT IMPACT
        </h2>
        <p style={{ fontSize: 16, color: "#dbeafe", lineHeight: 1.7, maxWidth: 640, margin: "0 auto 28px", textShadow: "0 2px 14px rgba(0,0,0,0.5)" }}>
          Every credit on Carbon Bridge represents real, verified impact on the ground — from rural farmers in Odisha to mangrove communities in West Bengal. See how your purchase becomes climate action.
        </p>
        <Btn size="lg" onClick={() => setPage("howitworks")} style={{ boxShadow: "0 0 48px rgba(34,197,94,0.4)" }}>
          See Our Impact →
        </Btn>
      </div>
    </section>
  );
}
