import { useState } from "react";
import { T } from "../theme.js";
import { CREDITS, COUNTRY_COUNT } from "../data/credits.js";

// Equirectangular projection.
//   x = ((lng + 180) / 360) * width
//   y = ((latMax - lat) / (latMax - latMin)) * height
// We clip latitude at -60 (skips most of Antarctica) and 80 so the map stays
// rectangular without huge empty bands.
const VB = { w: 720, h: 360, latMin: -60, latMax: 80 };
const project = (lat, lng) => ({
  x: ((lng + 180) / 360) * VB.w,
  y: ((VB.latMax - lat) / (VB.latMax - VB.latMin)) * VB.h,
});

// Pins: 6 Indian states + 2 international demos. Region-level names.
const PINS = [
  { id: "OD", region: "Odisha",      country: "India",     flag: "🇮🇳", lat: 20.9,  lng:  85.1, types: ["🐄 CBG", "🌱 Soil", "🌊 Ocean Plastic"], color: "#22c55e" },
  { id: "JH", region: "Jharkhand",   country: "India",     flag: "🇮🇳", lat: 23.6,  lng:  85.3, types: ["🌱 FPO Agroforestry"], color: "#10b981" },
  { id: "RJ", region: "Rajasthan",   country: "India",     flag: "🇮🇳", lat: 27.0,  lng:  74.2, types: ["🌾 Biomass Pellets"], color: "#f59e0b" },
  { id: "HR", region: "Haryana",     country: "India",     flag: "🇮🇳", lat: 29.1,  lng:  76.4, types: ["🐄 SATAT CBG Cluster"], color: "#06b6d4" },
  { id: "KA", region: "Karnataka",   country: "India",     flag: "🇮🇳", lat: 15.3,  lng:  75.7, types: ["♻️ EPR Plastic"], color: "#ec4899" },
  { id: "WB", region: "West Bengal", country: "India",     flag: "🇮🇳", lat: 22.5,  lng:  88.4, types: ["🌊 Sundarban Blue Carbon"], color: "#0891b2" },
  { id: "BR", region: "Amazonas",    country: "Brazil",    flag: "🇧🇷", lat: -3.0,  lng: -60.0, types: ["🌳 Amazon REDD+"], color: "#10b981", demo: true },
  { id: "KE", region: "Nairobi",     country: "Kenya",     flag: "🇰🇪", lat: -1.3,  lng:  36.8, types: ["🔥 Clean Cookstoves"], color: "#22d3ee", demo: true },
];

// Match each pin against the data file so we can show real available tonnes
// in the tooltip + below-map legend.
const projected = PINS.map((p) => {
  const { x, y } = project(p.lat, p.lng);
  const matching = CREDITS.filter(
    (c) => (p.country === "India" ? c.state === p.region : c.country === p.country),
  );
  const totalAvailable = matching.reduce((s, c) => s + (c.available || 0), 0);
  return { ...p, x, y, matchingCredits: matching, totalAvailable };
});

// Stylised continent outlines. NOT geographically accurate — intentionally
// rough (single hand-drawn paths) so it reads as "a world map" without
// distracting from the pins. viewBox 720x360, equirectangular bounds above.
//
// Subpaths in order: North America, Greenland, South America, UK/Ireland,
// Europe, Africa, Eurasia, Japan, Australia, New Zealand, Madagascar.
const WORLD_PATH = `
  M 40 95 Q 80 60 130 55 L 195 65 L 235 88 L 250 105 L 245 142 L 218 158 L 180 170 L 160 168 Q 140 165 128 145 L 110 122 L 85 102 L 55 95 Z
  M 270 25 L 320 25 L 332 55 L 308 75 L 280 70 L 268 40 Z
  M 255 175 L 290 195 L 295 235 L 280 280 L 245 322 L 215 305 L 205 250 L 215 200 L 240 180 Z
  M 340 70 L 358 65 L 362 90 L 345 96 Z
  M 365 40 L 395 45 L 415 65 L 432 90 L 432 110 L 405 122 L 380 118 L 350 113 L 335 95 L 340 72 L 352 50 Z
  M 340 132 L 425 132 L 440 172 L 446 200 L 432 232 L 415 268 L 398 295 L 380 290 L 365 252 L 355 215 L 350 195 L 340 175 L 332 155 L 338 138 Z
  M 425 60 Q 470 35 545 30 L 615 35 L 685 50 L 715 80 L 705 112 L 670 132 L 640 148 L 615 168 L 585 184 L 555 178 L 535 198 L 515 210 L 500 198 L 485 182 L 470 175 L 450 168 L 438 145 L 435 115 L 430 90 Z
  M 645 105 L 665 110 L 660 132 L 642 130 L 645 110 Z
  M 575 240 Q 605 235 645 232 L 660 252 L 660 285 L 640 295 L 605 295 L 580 285 Z
  M 685 290 L 695 285 L 698 305 L 686 305 Z
  M 430 245 L 442 235 L 446 252 L 442 270 L 432 270 Z
`.replace(/\s+/g, " ").trim();

export default function WorldMap({ onPinClick }) {
  const [hovered, setHovered] = useState(null);

  return (
    <section style={{ padding: "60px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Carbon Credits Across the World
        </h2>
        <p style={{ color: T.text2, fontSize: 14 }}>
          {CREDITS.length} active and demo Carbon Bridge projects across {COUNTRY_COUNT} countries
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
          .cb-world-outline {
            fill: rgba(34,197,94,0.04);
            stroke: rgba(56,189,248,0.4);
            stroke-width: 1.2;
            stroke-linejoin: round;
          }
          .cb-grid-line {
            stroke: rgba(56,189,248,0.07);
            stroke-width: 0.5;
            stroke-dasharray: 2 4;
          }
        `}</style>

        <svg
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          style={{ width: "100%", maxWidth: 760, height: "auto", aspectRatio: `${VB.w}/${VB.h}` }}
          xmlns="http://www.w3.org/2000/svg"
          aria-label="World map showing Carbon Bridge project locations"
        >
          <defs>
            <radialGradient id="cb-world-glow" cx="50%" cy="50%" r="65%">
              <stop offset="0%"   stopColor="rgba(34,197,94,0.10)" />
              <stop offset="60%"  stopColor="rgba(34,197,94,0.03)" />
              <stop offset="100%" stopColor="rgba(34,197,94,0)" />
            </radialGradient>
          </defs>

          <rect x="0" y="0" width={VB.w} height={VB.h} fill="url(#cb-world-glow)" />

          {/* Equator + prime meridian as faint reference lines */}
          <line className="cb-grid-line" x1="0" y1={project(0, 0).y} x2={VB.w} y2={project(0, 0).y} />
          <line className="cb-grid-line" x1={project(0, 0).x} y1="0" x2={project(0, 0).x} y2={VB.h} />

          <path d={WORLD_PATH} className="cb-world-outline" />

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
            {p.flag} {p.region}{p.demo ? " (demo)" : ""} · {p.totalAvailable.toLocaleString("en-IN")} tCO₂e
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
        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 14, color: pin.color }}>
          {pin.flag} {pin.region}
        </span>
        <span style={{ fontSize: 10, color: T.text3, fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace" }}>
          {pin.country}{pin.demo ? " · DEMO" : ""}
        </span>
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
