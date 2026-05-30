import { T } from "../../theme.js";

const ITEMS = [
  { icon: "🌿", label: "Verra VCS India",      value: "₹582/t" },
  { icon: "☀️", label: "Gold Standard IN",     value: "₹748/t" },
  { icon: "🐄", label: "CBG AMS-III.R",        value: "₹610/t" },
  { icon: "♻️", label: "CPCB EPR Plastic",     value: "₹920/t" },
  { icon: "🌱", label: "Soil Carbon",          value: "₹475/t" },
  { icon: "🌊", label: "Ocean Plastic",        value: "₹1,180/t" },
  { icon: "💧", label: "Green H₂ NGHM",        value: "₹2,088/t", positive: true },
  { icon: "📈", label: "India VCM",            value: "+12.4% YTD", positive: true },
  { icon: "🔥", label: "SIGHT Phase II",       value: "4.5L t/yr awarded", positive: true },
];

const SEPARATOR = "  •  ";

function Item({ item }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: T.text2, fontSize: 13, fontWeight: 500, padding: "0 6px" }}>
      <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>{item.icon}</span>
      <span>{item.label}</span>
      <span style={{ color: item.positive ? "#86efac" : T.teal, fontWeight: 700, fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", letterSpacing: 0.3 }}>
        {item.value}
      </span>
      <span style={{ color: T.text3, marginLeft: 4, opacity: 0.6 }}>{SEPARATOR}</span>
    </span>
  );
}

export default function Ticker() {
  return (
      <div
        role="region"
        aria-label="India carbon credit price ticker"
        style={{
          position: "relative",
          background: "linear-gradient(90deg, #050b16 0%, #0d1525 50%, #050b16 100%)",
          borderBottom: `1px solid ${T.border}`,
          overflow: "hidden",
          height: 36,
          display: "flex",
          alignItems: "center",
        }}
      >
      <style>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .cb-ticker-track {
          display: inline-flex;
          flex-wrap: nowrap;
          align-items: center;
          white-space: nowrap;
          will-change: transform;
          animation: ticker 60s linear infinite;
        }
        .cb-ticker-track:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .cb-ticker-track { animation-duration: 240s; }
        }
        .cb-ticker-fade-l, .cb-ticker-fade-r {
          position: absolute; top: 0; bottom: 0; width: 60px;
          pointer-events: none; z-index: 2;
        }
        .cb-ticker-fade-l { left: 0;  background: linear-gradient(90deg, #050b16, transparent); }
        .cb-ticker-fade-r { right: 0; background: linear-gradient(-90deg, #050b16, transparent); }
      `}</style>

      <div className="cb-ticker-fade-l" />
      <div className="cb-ticker-fade-r" />

      <div className="cb-ticker-track">
        {/* Render the items twice so the loop seam is invisible:
            translateX(-50%) lands the second copy exactly where the first
            copy started, so the animation can restart without a jump. */}
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <Item key={i} item={item} />
        ))}
      </div>
      </div>
  );
}
