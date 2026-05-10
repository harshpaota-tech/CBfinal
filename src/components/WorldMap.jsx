import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { geoMercator } from "d3-geo";
import worldGeo from "world-atlas/countries-110m.json";
import { T } from "../theme.js";
import { CREDITS, COUNTRY_COUNT } from "../data/credits.js";

// =============================================================================
// Real topojson world map (Natural Earth 110m via world-atlas npm package).
// react-simple-maps wraps d3-geo for projection + path generation.
// =============================================================================

const VB = { w: 800, h: 420 };
const PROJECTION_CONFIG = { scale: 130, center: [10, 25] };

// Stand-alone d3 projection used to compute pin pixel coords for tooltip
// positioning OUTSIDE the SVG (since tooltips are HTML, not SVG).
const projection = geoMercator()
  .scale(PROJECTION_CONFIG.scale)
  .center(PROJECTION_CONFIG.center)
  .translate([VB.w / 2, VB.h / 2]);

const PINS = [
  { id: "OD", region: "Odisha",      country: "India",  flag: "🇮🇳", lat: 20.9,  lng:  85.1, types: ["🐄 CBG", "🌱 Soil", "🌊 Ocean Plastic"], color: "#22c55e" },
  { id: "JH", region: "Jharkhand",   country: "India",  flag: "🇮🇳", lat: 23.6,  lng:  85.3, types: ["🌱 FPO Agroforestry"], color: "#10b981" },
  { id: "RJ", region: "Rajasthan",   country: "India",  flag: "🇮🇳", lat: 27.0,  lng:  74.2, types: ["🌾 Biomass Pellets"], color: "#f59e0b" },
  { id: "HR", region: "Haryana",     country: "India",  flag: "🇮🇳", lat: 29.1,  lng:  76.4, types: ["🐄 SATAT CBG Cluster"], color: "#06b6d4" },
  { id: "KA", region: "Karnataka",   country: "India",  flag: "🇮🇳", lat: 15.3,  lng:  75.7, types: ["♻️ EPR Plastic"], color: "#ec4899" },
  { id: "WB", region: "West Bengal", country: "India",  flag: "🇮🇳", lat: 22.5,  lng:  88.4, types: ["🌊 Sundarban Blue Carbon"], color: "#0891b2" },
  { id: "BR", region: "Amazonas",    country: "Brazil", flag: "🇧🇷", lat: -3.0,  lng: -60.0, types: ["🌳 Amazon REDD+"], color: "#10b981", demo: true },
  { id: "KE", region: "Nairobi",     country: "Kenya",  flag: "🇰🇪", lat: -1.3,  lng:  36.8, types: ["🔥 Clean Cookstoves"], color: "#22d3ee", demo: true },
];

const enrichedPins = PINS.map((p) => {
  const matching = CREDITS.filter(
    (c) => (p.country === "India" ? c.state === p.region : c.country === p.country),
  );
  const totalAvailable = matching.reduce((s, c) => s + (c.available || 0), 0);
  const [px, py] = projection([p.lng, p.lat]) || [0, 0];
  return { ...p, totalAvailable, px, py };
});

const GEO_STYLE = {
  default: { fill: "rgba(34,197,94,0.05)", stroke: "rgba(56,189,248,0.45)", strokeWidth: 0.5, outline: "none" },
  hover:   { fill: "rgba(34,197,94,0.10)", stroke: "rgba(56,189,248,0.55)", strokeWidth: 0.6, outline: "none" },
  pressed: { fill: "rgba(34,197,94,0.12)", stroke: "rgba(56,189,248,0.6)",  strokeWidth: 0.6, outline: "none" },
};

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
          .cb-rsm-svg { width: 100%; height: auto; max-width: 900px; }
        `}</style>

        <div style={{ position: "relative", width: "100%", maxWidth: 900 }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={PROJECTION_CONFIG}
            width={VB.w}
            height={VB.h}
            className="cb-rsm-svg"
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

            <Geographies geography={worldGeo}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography key={geo.rsmKey} geography={geo} style={GEO_STYLE} />
                ))
              }
            </Geographies>

            {enrichedPins.map((p) => (
              <Marker
                key={p.id}
                coordinates={[p.lng, p.lat]}
                onClick={() => onPinClick?.(p)}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered((h) => (h === p.id ? null : h))}
              >
                <g className="cb-pin-group">
                  <circle r={14} fill={p.color} fillOpacity={0.35} className="cb-pin-ring" />
                  <circle r={6}  fill={p.color} className="cb-pin-dot" />
                  <circle r={2.2} fill="#ffffff" />
                </g>
              </Marker>
            ))}
          </ComposableMap>

          {hovered && <PinTooltip pin={enrichedPins.find((p) => p.id === hovered)} />}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 28 }}>
        {enrichedPins.map((p) => (
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
  // Position the tooltip above the pin using percentages of the SVG viewBox,
  // since the SVG is responsive and absolute pixels would drift.
  const pctX = (pin.px / VB.w) * 100;
  const pctY = (pin.py / VB.h) * 100;
  return (
    <div
      style={{
        position: "absolute",
        left: `calc(${pctX}% - 110px)`,
        top: `calc(${pctY}% - 130px)`,
        width: 220,
        background: T.bg2,
        border: `1px solid ${pin.color}66`,
        borderRadius: 12,
        padding: 12,
        boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
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
