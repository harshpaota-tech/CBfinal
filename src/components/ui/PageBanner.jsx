import { T } from "../../theme.js";
import { bgImage } from "../../data/media.js";

/**
 * Editorial half-height hero banner for subpages. Uses the same Ken Burns
 * slow-zoom animation as the home hero so every page feels consistent. The
 * dark gradient guarantees text legibility regardless of which photo loads.
 */
export default function PageBanner({ tag, title, subtitle, photo, accent = "#86efac", height = 320, children }) {
  return (
    <section style={{
      position: "relative",
      minHeight: height,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "70px 24px",
      overflow: "hidden",
      borderBottom: `1px solid ${T.border}`,
    }}>
      <style>{`
        @keyframes cb-banner-ken {
          0%   { transform: scale(1.06) translate(0,0); }
          50%  { transform: scale(1.14) translate(-1%,-1%); }
          100% { transform: scale(1.06) translate(0,0); }
        }
        .cb-banner-bg {
          animation: cb-banner-ken 30s ease-in-out infinite;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          .cb-banner-bg { animation: none; transform: scale(1.06); }
        }
      `}</style>

      <div aria-hidden="true" className="cb-banner-bg" style={{ position: "absolute", inset: -40, ...bgImage(photo) }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,8,15,0.50) 0%, rgba(4,8,15,0.78) 100%), radial-gradient(ellipse 60% 80% at 50% 50%, rgba(34,197,94,0.14), transparent 60%)" }} />

      <div style={{ position: "relative", maxWidth: 880 }}>
        {tag && (
          <div style={{ fontSize: 11, fontWeight: 800, color: accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14 }}>
            {tag}
          </div>
        )}
        <h1 style={{
          fontFamily: "'Outfit',sans-serif",
          fontSize: "clamp(30px,4.5vw,48px)",
          fontWeight: 900,
          lineHeight: 1.1,
          margin: 0,
          marginBottom: subtitle ? 16 : 0,
          color: "#ffffff",
          textShadow: "0 4px 24px rgba(0,0,0,0.55)",
          letterSpacing: -0.3,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: 16,
            color: "#dbeafe",
            lineHeight: 1.7,
            maxWidth: 640,
            margin: "0 auto",
            textShadow: "0 2px 14px rgba(0,0,0,0.5)",
          }}>
            {subtitle}
          </p>
        )}
        {children && <div style={{ marginTop: 22 }}>{children}</div>}
      </div>
    </section>
  );
}
