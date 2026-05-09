import { useState } from "react";
import { T } from "../theme.js";
import { CREDITS } from "../data/credits.js";

// SVG viewBox spans these geographic bounds. Anything outside is clipped.
const VB = { w: 500, h: 600, lngMin: 67, lngMax: 99, latMin: 6, latMax: 37 };

const project = (lat, lng) => ({
  x: ((lng - VB.lngMin) / (VB.lngMax - VB.lngMin)) * VB.w,
  y: ((VB.latMax - lat) / (VB.latMax - VB.latMin)) * VB.h,
});

// Six pins matching the marketplace data. label aggregates the credit types
// for that state (e.g. Odisha has CBG + Soil + Ocean Plastic).
const PINS = [
  { id: "OD", state: "Odisha",      lat: 20.9, lng: 85.1, types: ["🐄 CBG", "🌱 Soil", "🌊 Ocean Plastic"], color: "#22c55e" },
  { id: "JH", state: "Jharkhand",   lat: 23.6, lng: 85.3, types: ["🌱 FPO Agroforestry"], color: "#10b981" },
  { id: "RJ", state: "Rajasthan",   lat: 27.0, lng: 74.2, types: ["🌾 Biomass Pellets"], color: "#f59e0b" },
  { id: "HR", state: "Haryana",     lat: 29.1, lng: 76.4, types: ["🐄 SATAT CBG Cluster"], color: "#06b6d4" },
  { id: "KA", state: "Karnataka",   lat: 15.3, lng: 75.7, types: ["♻️ EPR Plastic"], color: "#ec4899" },
  { id: "WB", state: "West Bengal", lat: 22.5, lng: 88.4, types: ["🌊 Sundarban Blue Carbon"], color: "#0891b2" },
];

// Build pin objects with projected coords + matching credits from data.
const projected = PINS.map((p) => {
  const { x, y } = project(p.lat, p.lng);
  const matchingCredits = CREDITS.filter((c) => c.state === p.state);
  const totalAvailable = matchingCredits.reduce((s, c) => s + (c.available || 0), 0);
  return { ...p, x, y, matchingCredits, totalAvailable };
});

// Stylised India outline. Not geographically precise — intentionally rough so
// it reads as "a map of India" without distracting from the pins.
const INDIA_PATH = `
  M 252 60
  Q 285 52 318 70
  L 358 96
  Q 392 105 410 142
  Q 422 175 410 208
  L 388 232
  Q 408 252 396 282
  L 372 308
  Q 358 332 348 365
  L 332 410
  Q 314 458 290 498
  Q 268 542 232 562
  Q 200 552 178 510
  L 158 460
  Q 138 412 122 360
  L 105 308
  Q 88 258 92 210
  L 102 168
  Q 122 148 152 142
  L 188 130
  Q 210 102 230 78
  Z
`.replace(/\s+/g, " ").trim();

export default function IndiaMap({ onPinClick }) {
  const [hovered, setHovered] = useState(null);

  return (
    <section style={{ padding: "60px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Carbon Credits Across India
        </h2>
        <p style={{ color: T.text2, fontSize: 14 }}>
          Each pin = active or potential Carbon Bridge project
        </p>
      </div>

      <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
        <style>{`
          @keyframes cb-pulse-ring {
            0%   { transform: scale(0.6); opacity: 0.7; }
            100% { transform: scale(2.4); opacity: 0; }
          }
          @keyframes cb-pulse-dot {
            0%, 100% { transform: scale(1); }
            50%      { transform: scale(1.18); }
          }
          .cb-pin-group { cursor: pointer; }
          .cb-pin-group:hover .cb-pin-dot { transform: scale(1.45); }
          .cb-pin-ring { transform-origin: center; transform-box: fill-box; animation: cb-pulse-ring 2.4s ease-out infinite; }
          .cb-pin-dot  { transform-origin: center; transform-box: fill-box; animation: cb-pulse-dot 2.4s ease-in-out infinite; transition: transform .2s; }
          .cb-india-outline {
            fill: rgba(34,197,94,0.04);
            stroke: rgba(56,189,248,0.35);
            stroke-width: 1.5;
          }
        `}</style>

        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          style={{ width: "100%", maxWidth: 540, height: "auto", aspectRatio: `${VB.w}/${VB.h}` }}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Map of India showing Carbon Bridge project locations"
        >
          <defs>
            <radialGradient id="cb-india-glow" cx="50%" cy="48%" r="55%">
              <stop offset="0%"   stopColor="rgba(34,197,94,0.10)" />
              <stop offset="60%"  stopColor="rgba(34,197,94,0.03)" />
              <stop offset="100%" stopColor="rgba(34,197,94,0)" />
            </radialGradient>
          </defs>

          <rect x="0" y="0" width={VB.w} height={VB.h} fill="url(#cb-india-glow)" />

          <path d={INDIA_PATH} className="cb-india-outline" />

          {projected.map((p) => (
            <g
              key={p.id}
              className="cb-pin-group"
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered((h) => (h === p.id ? null : h))}
              onClick={() => onPinClick?.(p)}
            >
              <circle cx={p.x} cy={p.y} r={14} fill={p.color} fillOpacity={0.35} className="cb-pin-ring" />
              <circle cx={p.x} cy={p.y} r={6}  fill={p.color} className="cb-pin-dot" />
              <circle cx={p.x} cy={p.y} r={2.2} fill="#ffffff" />
            </g>
          ))}
        </svg>

        {/* Tooltip rendered as an absolutely-positioned card so it can be
            styled with normal CSS (SVG <title> elements are slow + ugly). */}
        {hovered && <PinTooltip pin={projected.find((p) => p.id === hovered)} />}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 28 }}>
        {projected.map((p) => (
          <span
            key={p.id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 12px",
              borderRadius: 999,
              border: `1px solid ${p.color}55`,
              background: p.color + "12",
              fontSize: 12,
              color: T.text2,
              fontWeight: 500,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 999, background: p.color }} />
            {p.state} · {p.totalAvailable.toLocaleString("en-IN")} tCO₂e
          </span>
        ))}
      </div>
    </section>
  );
}

function PinTooltip({ pin }) {
  if (!pin) return null;
  const pctX = (pin.x / VB.w) * 100;
  const pctY = (pin.y / VB.h) * 100;
  return (
    <div
      style={{
        position: "absolute",
        left: `calc(${pctX}% - 110px)`,
        top: `calc(${pctY}% - 110px)`,
        width: 220,
        background: T.bg2,
        border: `1px solid ${pin.color}66`,
        borderRadius: 12,
        padding: 12,
        boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
        pointerEvents: "none",
        zIndex: 5,
        animation: "cb-tooltip-in .15s ease",
      }}
    >
      <style>{`@keyframes cb-tooltip-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 14, color: pin.color }}>{pin.state}</span>
        <span style={{ fontSize: 11, color: T.text3, fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace" }}>{pin.id}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
        {pin.types.map((t) => (
          <span key={t} style={{ fontSize: 12, color: T.text2 }}>{t}</span>
        ))}
      </div>
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 6, fontSize: 11, color: T.text3 }}>
        {pin.totalAvailable.toLocaleString("en-IN")} tCO₂e available
      </div>
    </div>
  );
}
