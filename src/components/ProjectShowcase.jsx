import { useTranslation } from "react-i18next";
import { T } from "../theme.js";
import Btn from "./ui/Btn.jsx";
import Badge from "./ui/Badge.jsx";
import { getFeatured, formatINR, formatUSD } from "../data/credits.js";
import { PROJECT_PHOTOS, bgImage } from "../data/media.js";

/**
 * Editorial-style featured project showcase. Replaces the plain MiniCard grid
 * with photo-led cards (image on top, content overlaid in the bottom half).
 * Same data source as before (getFeatured()) so any change in credits.js
 * propagates here automatically.
 */
export default function ProjectShowcase({ setPage }) {
  const { t } = useTranslation();
  const featured = getFeatured();
  if (featured.length === 0) return null;

  return (
    <section style={{ padding: "80px 24px", background: T.bg1, borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#86efac", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Featured Projects</div>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(28px,4vw,38px)", fontWeight: 900, margin: 0, lineHeight: 1.15, maxWidth: 720 }}>
              Handpicked high-impact credits from Indian operators
            </h2>
          </div>
          <Btn variant="outline" onClick={() => setPage("marketplace")}>View All →</Btn>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 22 }}>
          {featured.map((c) => (
            <ShowcaseCard
              key={c.id}
              c={c}
              t={t}
              onClick={() => setPage("marketplace")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({ c, t, onClick }) {
  const photo = PROJECT_PHOTOS[c.id];
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        textAlign: "left",
        background: T.bg2,
        border: `1px solid ${T.border}`,
        borderRadius: 22,
        overflow: "hidden",
        cursor: "pointer",
        padding: 0,
        fontFamily: "inherit",
        transition: "transform .3s ease, border-color .2s, box-shadow .3s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.borderColor = c.color + "55";
        e.currentTarget.style.boxShadow = `0 16px 48px ${c.color}22`;
        const img = e.currentTarget.querySelector("[data-showcase-img]");
        if (img) img.style.transform = "scale(1.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.boxShadow = "none";
        const img = e.currentTarget.querySelector("[data-showcase-img]");
        if (img) img.style.transform = "none";
      }}
    >
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
        <div data-showcase-img style={{ position: "absolute", inset: 0, transition: "transform .8s ease", ...(photo ? bgImage(photo) : { background: c.color + "33" }) }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,8,15,0.05) 50%, rgba(4,8,15,0.85) 100%)" }} />

        <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 8 }}>
          <Badge color={c.color}>{c.type}</Badge>
        </div>

        <div style={{ position: "absolute", top: 14, right: 14, background: "rgba(13,21,37,0.6)", backdropFilter: "blur(8px)", border: `1px solid ${T.border}`, borderRadius: 999, padding: "4px 10px", fontSize: 12, color: T.text2, fontWeight: 600 }}>
          {c.flag} {c.state}
        </div>

        <div style={{ position: "absolute", left: 18, bottom: 16, right: 18 }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 19, lineHeight: 1.25, color: "#fff", margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
            {c.name}
          </h3>
        </div>
      </div>

      <div style={{ padding: "20px 22px" }}>
        <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.6, margin: 0, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {c.desc}
        </p>

        <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
          <Chip>{c.registry}</Chip>
          <Chip>Vintage {c.vintage}</Chip>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: `1px dashed ${T.border}`, paddingTop: 12 }}>
          <div>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 24, fontWeight: 900, color: T.green, lineHeight: 1 }}>
              {formatINR(c.price)}<span style={{ fontSize: 12, fontWeight: 400, color: T.text3 }}>/t</span>
            </div>
            <div style={{ fontSize: 10, color: T.text3, marginTop: 4 }}>{formatUSD(c.price)} USD · {t("credits.perTonne")}</div>
          </div>
          <div style={{ fontSize: 11, color: T.text3, textAlign: "right" }}>
            <div style={{ fontWeight: 700, color: T.text1, fontSize: 14 }}>{c.available.toLocaleString("en-IN")}</div>
            {t("credits.available")}
          </div>
        </div>
      </div>
    </button>
  );
}

function Chip({ children }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, color: T.text2, padding: "3px 9px", borderRadius: 999, border: `1px solid ${T.border}` }}>
      {children}
    </span>
  );
}
