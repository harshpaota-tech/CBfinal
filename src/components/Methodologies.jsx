import { useMemo, useState } from "react";
import { T } from "../theme.js";
import Btn from "./ui/Btn.jsx";
import PageBanner from "./ui/PageBanner.jsx";
import { ALL_METHODOLOGIES, REGISTRIES, CATEGORIES, LATEST_METHODOLOGY_CODES, METHODOLOGY_COUNTS } from "../data/methodologies.js";
import { CATEGORY_PHOTOS, PAGE_BANNERS, bgImage } from "../data/media.js";

export default function Methodologies({ setPage }) {
  const [registry, setRegistry] = useState("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [expandedCode, setExpandedCode] = useState(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_METHODOLOGIES.filter((m) => {
      if (registry !== "all" && m.registry !== registry) return false;
      if (category !== "all" && m.category !== category) return false;
      if (!q) return true;
      return (
        m.code.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.desc.toLowerCase().includes(q) ||
        m.scope.toLowerCase().includes(q) ||
        (m.used || "").toLowerCase().includes(q)
      );
    });
  }, [registry, category, query]);

  const latest = LATEST_METHODOLOGY_CODES
    .map((code) => ALL_METHODOLOGIES.find((m) => m.code === code))
    .filter(Boolean);

  return (
    <div className="fade">
      <PageBanner
        tag="Methodology Catalog"
        title="Every methodology under which Carbon Bridge can earn credits"
        subtitle={`${METHODOLOGY_COUNTS.total} methodologies across Verra (VCS), Gold Standard, and India's domestic regulatory regimes — including the new Green Hydrogen credit class under NGHM.`}
        photo={PAGE_BANNERS.methodologies}
        height={360}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "50px 24px 80px" }}>
      {/* Registry stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 36 }}>
        {REGISTRIES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRegistry(registry === r.id ? "all" : r.id)}
            style={{
              textAlign: "left",
              background: registry === r.id ? r.color + "18" : T.bg2,
              border: `1.5px solid ${registry === r.id ? r.color + "88" : T.border}`,
              borderRadius: 16,
              padding: "18px 20px",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 22 }}>{r.logo}</span>
              <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 800, color: T.text1 }}>{r.name}</span>
            </div>
            <div style={{ fontSize: 12, color: T.text3, marginBottom: 10, lineHeight: 1.5 }}>{r.tag}</div>
            <div style={{ fontSize: 22, fontFamily: "'Outfit',sans-serif", fontWeight: 900, color: r.color }}>
              {METHODOLOGY_COUNTS[r.id]} <span style={{ fontSize: 12, color: T.text3, fontWeight: 600 }}>methodologies</span>
            </div>
          </button>
        ))}
      </div>

      {/* Latest additions — photo cards */}
      {latest.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#5eead4", letterSpacing: 2, textTransform: "uppercase" }}>Latest & Emerging</span>
            <span style={{ background: "rgba(20,184,166,0.12)", color: "#5eead4", border: "1px solid rgba(20,184,166,0.45)", borderRadius: 999, padding: "2px 9px", fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>UPDATED 2026</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
            {latest.map((m) => (
              <LatestCard
                key={m.code}
                m={m}
                onClick={() => { setExpandedCode(m.code); document.getElementById(`m-${m.code}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, padding: 20, marginBottom: 24, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 280px", minWidth: 240 }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: 0.7 }}>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search methodology code, name, scope…"
              style={{
                width: "100%",
                background: T.bg1,
                border: `1px solid ${T.border}`,
                color: T.text1,
                fontSize: 14,
                padding: "12px 16px 12px 42px",
                borderRadius: 12,
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>
          <select
            value={registry}
            onChange={(e) => setRegistry(e.target.value)}
            style={selectStyle}
            aria-label="Filter by registry"
          >
            <option value="all">All Registries ({METHODOLOGY_COUNTS.total})</option>
            {REGISTRIES.map((r) => (
              <option key={r.id} value={r.id}>{r.name} ({METHODOLOGY_COUNTS[r.id]})</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                style={{
                  background: active ? "rgba(34,197,94,0.14)" : "transparent",
                  border: `1px solid ${active ? "#22c55e" : T.border}`,
                  color: active ? "#86efac" : T.text2,
                  padding: "6px 13px",
                  borderRadius: 999,
                  fontSize: 12,
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
      </div>

      {/* Results meta */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, color: T.text3, fontSize: 13, flexWrap: "wrap", gap: 6 }}>
        <span>
          Showing <strong style={{ color: T.text1 }}>{visible.length}</strong> of {METHODOLOGY_COUNTS.total} methodologies
        </span>
        {(registry !== "all" || category !== "all" || query) && (
          <button onClick={() => { setRegistry("all"); setCategory("all"); setQuery(""); }} style={{ background: "none", border: "none", color: "#86efac", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: 0 }}>
            Clear all filters
          </button>
        )}
      </div>

      {/* Cards */}
      {visible.length === 0 ? (
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, color: T.text2, marginBottom: 18 }}>No methodologies match those filters.</div>
          <Btn variant="outline" size="sm" onClick={() => { setRegistry("all"); setCategory("all"); setQuery(""); }}>Reset filters</Btn>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {visible.map((m) => (
            <MethodologyCard
              key={m.code}
              m={m}
              expanded={expandedCode === m.code}
              onToggle={() => setExpandedCode((c) => (c === m.code ? null : m.code))}
            />
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: 56, padding: "40px 32px", background: "linear-gradient(135deg, rgba(20,184,166,0.10), rgba(34,197,94,0.05))", border: "1px solid rgba(20,184,166,0.35)", borderRadius: 22, textAlign: "center" }}>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Have a project that fits one of these methodologies?</h3>
        <p style={{ color: T.text2, fontSize: 14, marginBottom: 22, maxWidth: 540, margin: "0 auto 22px", lineHeight: 1.6 }}>
          Carbon Bridge aggregates smallholder projects into Programmes of Activity, cutting per-project registration cost by up to 90%. We handle Verra/Gold Standard/CPCB paperwork end-to-end.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn onClick={() => setPage("sell")}>Register your project →</Btn>
          <Btn variant="outline" onClick={() => setPage("business")}>Talk to our team</Btn>
        </div>
      </div>
      </div>
    </div>
  );
}

function LatestCard({ m, onClick }) {
  const photo = CATEGORY_PHOTOS[m.category];
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "relative",
        textAlign: "left",
        background: T.bg2,
        border: "1px solid rgba(20,184,166,0.35)",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        fontFamily: "inherit",
        padding: 0,
        transition: "transform .2s, border-color .2s, box-shadow .3s",
        minHeight: 200,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.borderColor = "rgba(20,184,166,0.7)";
        e.currentTarget.style.boxShadow = "0 12px 36px rgba(20,184,166,0.22)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = "rgba(20,184,166,0.35)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ position: "absolute", inset: 0, ...(photo ? bgImage(photo) : {}) }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,8,15,0.55) 0%, rgba(4,8,15,0.92) 100%), linear-gradient(135deg, rgba(20,184,166,0.18), transparent 60%)" }} />
      <div style={{ position: "relative", padding: "16px 18px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", minHeight: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <RegistryPill registry={m.registry} small />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#5eead4", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", letterSpacing: 0.5, marginBottom: 4 }}>{m.code}</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#ffffff", lineHeight: 1.25, marginBottom: 6, textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}>{m.name}</div>
          <div style={{ fontSize: 11, color: "#cbd5e1" }}>{categoryLabel(m.category)}</div>
        </div>
      </div>
    </button>
  );
}

function MethodologyCard({ m, expanded, onToggle }) {
  const photo = CATEGORY_PHOTOS[m.category];
  return (
    <article
      id={`m-${m.code}`}
      style={{
        background: T.bg2,
        border: `1px solid ${expanded ? "rgba(34,197,94,0.4)" : T.border}`,
        borderRadius: 16,
        overflow: "hidden",
        transition: "border-color .2s",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          textAlign: "left",
          background: "none",
          border: "none",
          color: T.text1,
          padding: "16px 18px",
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        {/* Square thumbnail keyed to the category */}
        <div style={{
          flexShrink: 0,
          width: 86,
          height: 86,
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
          alignSelf: "flex-start",
          border: `1px solid ${T.border}`,
        }}>
          {photo && <div style={{ position: "absolute", inset: 0, ...bgImage(photo) }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(4,8,15,0.10), rgba(4,8,15,0.55))" }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <RegistryPill registry={m.registry} />
            <CategoryPill category={m.category} />
            <span style={{ fontSize: 12, fontWeight: 800, color: "#86efac", fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", letterSpacing: 0.5 }}>{m.code}</span>
          </div>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 17, lineHeight: 1.3, margin: 0, marginBottom: 6 }}>
            {m.name}
          </h3>
          <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.55, margin: 0 }}>{m.scope}</p>
        </div>

        <div
          style={{
            flexShrink: 0,
            alignSelf: "center",
            width: 30,
            height: 30,
            borderRadius: 999,
            background: expanded ? "rgba(34,197,94,0.15)" : T.bg1,
            border: `1px solid ${expanded ? "rgba(34,197,94,0.45)" : T.border}`,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: expanded ? "#86efac" : T.text2,
            fontSize: 14,
            fontWeight: 800,
            transition: "all .2s",
          }}
          aria-hidden="true"
        >
          {expanded ? "−" : "+"}
        </div>
      </button>

      {expanded && (
        <div style={{ borderTop: `1px dashed ${T.border}` }}>
          {/* Expanded view: wide hero photo + full description */}
          <div style={{ position: "relative", aspectRatio: "21/8", overflow: "hidden" }}>
            {photo && <div style={{ position: "absolute", inset: 0, ...bgImage(photo) }} />}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,8,15,0.20) 0%, rgba(4,8,15,0.75) 100%)" }} />
            <div style={{ position: "absolute", bottom: 14, left: 18, right: 18, fontSize: 12, color: "#cbd5e1", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
              {categoryLabel(m.category)} · {m.code}
            </div>
          </div>

          <div style={{ padding: "18px 22px 22px" }}>
            <p style={{ fontSize: 14, color: T.text1, lineHeight: 1.75, margin: 0, marginBottom: 14 }}>
              {m.desc}
            </p>
            {m.used && (
              <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ fontSize: 16, lineHeight: "20px" }}>🔗</span>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 3 }}>Carbon Bridge use</div>
                  <div style={{ fontSize: 13, color: T.text1, lineHeight: 1.5 }}>{m.used}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function RegistryPill({ registry, small }) {
  const r = REGISTRIES.find((x) => x.id === registry);
  if (!r) return null;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      background: r.color + "1f",
      color: r.color,
      border: `1px solid ${r.color}66`,
      padding: small ? "1px 7px" : "3px 9px",
      borderRadius: 999,
      fontSize: small ? 10 : 11,
      fontWeight: 700,
      letterSpacing: 0.5,
      textTransform: "uppercase",
      fontFamily: "'Outfit',sans-serif",
    }}>
      <span aria-hidden style={{ fontSize: small ? 11 : 12 }}>{r.logo}</span>
      {r.name}
    </span>
  );
}

function CategoryPill({ category }) {
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 600,
      color: T.text2,
      padding: "3px 9px",
      borderRadius: 999,
      border: `1px solid ${T.border}`,
    }}>
      {categoryLabel(category)}
    </span>
  );
}

function categoryLabel(id) {
  return CATEGORIES.find((c) => c.id === id)?.label || id;
}

const selectStyle = {
  background: "#070d18",
  border: "1px solid rgba(56,189,248,0.12)",
  color: "#e6f1ff",
  fontSize: 14,
  padding: "12px 16px",
  borderRadius: 12,
  outline: "none",
  fontFamily: "inherit",
  cursor: "pointer",
  minWidth: 240,
};
