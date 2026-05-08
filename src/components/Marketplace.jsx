import { useMemo, useState } from "react";
import { T } from "../App.jsx";
import { CATEGORIES, CREDITS, COUNTRY_COUNT } from "../data/credits.js";
import Btn from "./ui/Btn.jsx";
import Badge from "./ui/Badge.jsx";

const SORTS = [
  { id: "price-asc", label: "Price: Low → High" },
  { id: "price-desc", label: "Price: High → Low" },
  { id: "credits-desc", label: "Most Credits" },
  { id: "credits-asc", label: "Fewest Credits" },
];

function ProjectCard({ c }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#111d30" : T.bg2,
        border: `1.5px solid ${hov ? c.color + "66" : T.border}`,
        borderRadius: 20,
        padding: 24,
        transition: "all .25s",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Badge color={c.color}>{c.type}</Badge>
        <span style={{ fontSize: 12, color: T.text3, display: "inline-flex", alignItems: "center", gap: 5 }}>
          <span aria-hidden>{c.flag}</span>
          {c.country}
        </span>
      </div>

      <div style={{ fontSize: 32 }}>{c.icon}</div>

      <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 17, margin: 0 }}>{c.name}</h3>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: T.text2, padding: "3px 10px", borderRadius: 999, border: `1px solid ${T.border}` }}>{c.standard}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: T.text2, padding: "3px 10px", borderRadius: 999, border: `1px solid ${T.border}` }}>Vintage {c.vintage}</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 6 }}>
        <div>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 28, fontWeight: 900, color: T.green, lineHeight: 1 }}>
            ${c.price.toFixed(2)}
          </div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>per tonne CO₂</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700, color: T.text1 }}>{c.creditsLeft.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>credits left</div>
        </div>
      </div>
    </div>
  );
}

export default function Marketplace({ setPage }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("price-asc");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = CREDITS.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
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
        list.sort((a, b) => b.creditsLeft - a.creditsLeft);
        break;
      case "credits-asc":
        list.sort((a, b) => a.creditsLeft - b.creditsLeft);
        break;
      default:
        break;
    }
    return list;
  }, [query, category, sort]);

  return (
    <div className="fade" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 80px" }}>
      <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(34px,5vw,52px)", fontWeight: 900, margin: 0, marginBottom: 10 }}>
        Carbon Credit Marketplace
      </h1>
      <p style={{ color: T.text2, fontSize: 15, marginBottom: 32 }}>
        {CREDITS.length} verified projects · {COUNTRY_COUNT} countries
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 22, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 320px", minWidth: 240 }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: 0.7 }}>🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by project name or country..."
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
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            background: T.bg2,
            border: `1px solid ${T.border}`,
            color: T.text1,
            fontSize: 14,
            padding: "13px 16px",
            borderRadius: 14,
            outline: "none",
            fontFamily: "inherit",
            cursor: "pointer",
            minWidth: 200,
          }}
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id} style={{ background: T.bg2 }}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
        {CATEGORIES.map((cat) => {
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                background: active ? "rgba(56,189,248,0.15)" : "transparent",
                border: `1px solid ${active ? T.teal : T.border}`,
                color: active ? T.teal : T.text2,
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

      {visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 24px", color: T.text2, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 16, marginBottom: 6 }}>No projects match your filters.</div>
          <div style={{ fontSize: 13, color: T.text3, marginBottom: 18 }}>Try clearing the search or picking a different category.</div>
          <Btn variant="outline" onClick={() => { setQuery(""); setCategory("all"); }}>Reset filters</Btn>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
          {visible.map((c) => <ProjectCard key={c.id} c={c} />)}
        </div>
      )}

      <div style={{ marginTop: 60, textAlign: "center", padding: "44px 24px", background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 20 }}>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Need bulk pricing for your business?</h3>
        <p style={{ color: T.text2, fontSize: 14, marginBottom: 22 }}>Volume discounts and ESG-ready reporting for 1,000+ tonnes.</p>
        <Btn onClick={() => setPage("business")}>Contact our team →</Btn>
      </div>
    </div>
  );
}
