import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { T } from "../theme.js";
import { CATEGORIES, CREDITS, STATES, COUNTRY_COUNT, formatINR, formatUSD } from "../data/credits.js";
import { PROJECT_PHOTOS, PAGE_BANNERS, bgImage } from "../data/media.js";
import Btn from "./ui/Btn.jsx";
import Badge from "./ui/Badge.jsx";
import PageBanner from "./ui/PageBanner.jsx";

const SORTS = [
  { id: "price-asc", label: "Price: Low → High" },
  { id: "price-desc", label: "Price: High → Low" },
  { id: "credits-desc", label: "Most Credits" },
  { id: "credits-asc", label: "Fewest Credits" },
];

function ProjectCard({ c, onBuy }) {
  const { t } = useTranslation();
  const [hov, setHov] = useState(false);
  const photo = PROJECT_PHOTOS[c.id];
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.bg2,
        border: `1.5px solid ${hov ? c.color + "66" : T.border}`,
        borderRadius: 20,
        overflow: "hidden",
        transition: "all .25s",
        display: "flex",
        flexDirection: "column",
        boxShadow: hov ? `0 12px 36px ${c.color}22` : "none",
      }}
    >
      {/* Project photo strip */}
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden" }}>
        <div data-mkt-img style={{ position: "absolute", inset: 0, transition: "transform .6s ease", transform: hov ? "scale(1.06)" : "none", ...(photo ? bgImage(photo) : { background: c.color + "33" }) }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,8,15,0.10) 40%, rgba(4,8,15,0.65) 100%)" }} />
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Badge color={c.color}>{c.type}</Badge>
          {c.demo && (
            <Badge color="#f59e0b">Demo</Badge>
          )}
        </div>
        <div style={{ position: "absolute", top: 12, right: 12, fontSize: 11, color: "#fff", background: "rgba(13,21,37,0.7)", backdropFilter: "blur(8px)", border: `1px solid ${T.border}`, borderRadius: 999, padding: "3px 10px", fontWeight: 600 }}>
          {c.flag} {c.state}
        </div>
        <div style={{ position: "absolute", bottom: 10, left: 14, fontSize: 26 }}>{c.icon}</div>
      </div>

      <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 17, margin: 0, lineHeight: 1.25 }}>{c.name}</h3>

      {c.desc && (
        <p style={{ color: T.text2, fontSize: 13, lineHeight: 1.55, margin: 0, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {c.desc}
        </p>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: T.text2, padding: "3px 10px", borderRadius: 999, border: `1px solid ${T.border}` }}>{c.registry}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: T.text2, padding: "3px 10px", borderRadius: 999, border: `1px solid ${T.border}` }}>Vintage {c.vintage}</span>
      </div>

      {c.sdgs && c.sdgs.length > 0 && (
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: T.text3, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>SDG</span>
          {c.sdgs.map((n) => (
            <span key={n} style={{ fontSize: 11, fontWeight: 700, color: c.color, background: c.color + "1f", border: `1px solid ${c.color}55`, borderRadius: 6, padding: "1px 7px", minWidth: 22, textAlign: "center" }}>{n}</span>
          ))}
        </div>
      )}

      {c.certId && (
        <div style={{ fontSize: 10, color: T.text3, fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", letterSpacing: 0.3 }}>
          {c.certId}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 4, paddingTop: 10, borderTop: `1px dashed ${T.border}` }}>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 26, fontWeight: 900, color: T.green, lineHeight: 1 }}>
            {formatINR(c.price)}
          </div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>{formatUSD(c.price)} USD</div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{t("credits.perTonne")}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700, color: T.text1 }}>{c.available.toLocaleString("en-IN")}</div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{t("credits.available")}</div>
        </div>
      </div>

      <Btn onClick={() => onBuy?.(c)} style={{ width: "100%", marginTop: 6 }}>
        {t("credits.buyNow")} →
      </Btn>
      </div>
    </div>
  );
}

export default function Marketplace({ setPage, onBuy }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [sort, setSort] = useState("price-asc");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = CREDITS.filter((c) => {
      if (category !== "all" && c.type !== category) return false;
      if (stateFilter !== "all" && c.state !== stateFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        (c.desc || "").toLowerCase().includes(q)
      );
    });
    list = [...list];
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "credits-desc":
        list.sort((a, b) => b.available - a.available);
        break;
      case "credits-asc":
        list.sort((a, b) => a.available - b.available);
        break;
      default:
        break;
    }
    return list;
  }, [query, category, stateFilter, sort]);

  const selectStyle = {
    background: T.bg2,
    border: `1px solid ${T.border}`,
    color: T.text1,
    fontSize: 14,
    padding: "13px 16px",
    borderRadius: 14,
    outline: "none",
    fontFamily: "inherit",
    cursor: "pointer",
    minWidth: 180,
  };

  return (
    <div className="fade">
      <PageBanner
        tag="Marketplace"
        title="Buy verified environmental credits"
        subtitle={`${CREDITS.length} projects across ${COUNTRY_COUNT} ${COUNTRY_COUNT === 1 ? "country" : "countries"} · India-first, globally sourced · Settled in INR`}
        photo={PAGE_BANNERS.marketplace}
        height={300}
      />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "50px 24px 80px" }}>

      <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 280px", minWidth: 220 }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: 0.7 }}>🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by project name, state, or type..."
            style={{
              width: "100%",
              background: T.bg2,
              border: `1px solid ${T.border}`,
              color: T.text1,
              fontSize: 14,
              padding: "13px 16px 13px 42px",
              borderRadius: 14,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
        </div>
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} style={selectStyle} aria-label="Filter by region">
          <option value="all">All Regions</option>
          {STATES.map((s) => {
            const sample = CREDITS.find((c) => c.state === s);
            const country = sample?.country;
            const label = country && country !== "India" ? `${s} (${country})` : s;
            return <option key={s} value={s}>{label}</option>;
          })}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={selectStyle} aria-label="Sort projects">
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
        {CATEGORIES.map((cat) => {
          const active = category === cat.id;
          const tint = cat.id === "all" ? T.teal : cat.color;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                background: active ? tint + "26" : "transparent",
                border: `1px solid ${active ? tint : T.border}`,
                color: active ? tint : T.text2,
                padding: "8px 16px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .2s",
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {(category !== "all" || stateFilter !== "all" || query) && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, fontSize: 13, color: T.text3, flexWrap: "wrap" }}>
          <span>Showing {visible.length} of {CREDITS.length} projects</span>
          <button onClick={() => { setQuery(""); setCategory("all"); setStateFilter("all"); }} style={{ background: "none", border: "none", color: T.teal, fontWeight: 600, cursor: "pointer", fontSize: 13, padding: 0, fontFamily: "inherit" }}>
            Clear filters
          </button>
        </div>
      )}

      {visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", color: T.text2, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 16, marginBottom: 6 }}>No projects match your filters.</div>
          <div style={{ fontSize: 13, color: T.text3, marginBottom: 18 }}>Try clearing the search, picking a different state, or category.</div>
          <Btn variant="outline" onClick={() => { setQuery(""); setCategory("all"); setStateFilter("all"); }}>Reset filters</Btn>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 22 }}>
          {visible.map((c) => <ProjectCard key={c.id} c={c} onBuy={onBuy} />)}
        </div>
      )}

      <div style={{ marginTop: 60, textAlign: "center", padding: "44px 24px", background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 20 }}>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Need bulk pricing for your business?</h3>
        <p style={{ color: T.text2, fontSize: 14, marginBottom: 22 }}>Volume discounts and ESG-ready reporting for 1,000+ tonnes.</p>
        <Btn onClick={() => setPage("business")}>Contact our team →</Btn>
      </div>
      </div>
    </div>
  );
}
