import { useState } from "react";

export default function Logo({
  size = 36,
  withText = true,
  withTagline = false,
  variant = "dark",
  muted = "#5d7290",
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const isLight = variant === "light";

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
      {imgFailed ? (
        <SVGLogoMark size={size} variant={variant} />
      ) : (
        <img
          src="/logo.png"
          alt="CarbonBridge"
          width={size}
          height={size}
          onError={() => setImgFailed(true)}
          style={{ width: size, height: size, objectFit: "contain", flexShrink: 0, display: "block" }}
        />
      )}

      {withText && <LogoWordmark size={size} isLight={isLight} muted={muted} withTagline={withTagline} />}
    </div>
  );
}

function LogoWordmark({ size, isLight, muted, withTagline }) {
  const carbonColor = isLight ? "#0e3d1c" : "#ffffff";
  const bridgeColor = isLight ? "#7cc242" : "#86efac";
  return (
    <div style={{ lineHeight: 1.05 }}>
      <div
        style={{
          fontFamily: "'Outfit',sans-serif",
          fontWeight: 900,
          fontSize: Math.round(size * 0.5),
          letterSpacing: 1.2,
          whiteSpace: "nowrap",
          textTransform: "uppercase",
        }}
      >
        <span style={{ color: carbonColor }}>Carbon</span>
        <span style={{ color: bridgeColor, marginLeft: 4 }}>Bridge</span>
      </div>
      <div
        style={{
          fontSize: Math.max(8, Math.round(size * 0.2)),
          color: muted,
          marginTop: 3,
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {withTagline ? "Bridging today · Sustaining tomorrow" : "by Nomad Life Corporation"}
      </div>
    </div>
  );
}

function SVGLogoMark({ size, variant }) {
  const isLight = variant === "light";
  const ring = isLight ? "#0e3d1c" : "#ffffff";
  const bridge = isLight ? "#0e3d1c" : "#ffffff";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
      aria-label="CarbonBridge logo"
    >
      <defs>
        <linearGradient id={`cb-cont-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id={`cb-leaf-${variant}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>
        <clipPath id={`cb-globe-clip-${variant}`}>
          <circle cx="40" cy="40" r="24" />
        </clipPath>
      </defs>

      <circle cx="40" cy="40" r="26" fill="none" stroke={ring} strokeWidth="3" />

      <g clipPath={`url(#cb-globe-clip-${variant})`} fill={`url(#cb-cont-${variant})`}>
        <path d="M28 26 Q34 22 42 23 Q50 24 54 30 Q56 36 52 40 Q44 43 38 41 Q32 39 28 34 Z" />
        <path d="M36 44 Q42 44 46 49 Q47 56 42 60 Q35 60 34 54 Q34 48 36 44 Z" />
        <path d="M52 46 Q58 45 60 50 Q58 55 53 54 Q50 51 52 46 Z" />
      </g>

      <g clipPath={`url(#cb-globe-clip-${variant})`} stroke={isLight ? "rgba(14,61,28,0.18)" : "rgba(255,255,255,0.18)"} strokeWidth="0.8" fill="none">
        <ellipse cx="40" cy="40" rx="24" ry="9" />
        <line x1="40" y1="16" x2="40" y2="64" />
      </g>

      <path d="M58 28 Q72 14 82 18 Q80 32 68 40 Q56 40 58 28 Z" fill={`url(#cb-leaf-${variant})`} />
      <path d="M62 34 Q70 28 80 22" stroke="#16a34a" strokeWidth="0.9" fill="none" strokeLinecap="round" />

      <path d="M12 70 Q40 58 68 70 Q40 86 12 70 Z" fill="none" stroke={bridge} strokeWidth="2" strokeLinejoin="round" />
      {[
        { x: 18, top: 70.5, bot: 75 },
        { x: 23, top: 67.5, bot: 79 },
        { x: 29, top: 65.5, bot: 81.5 },
        { x: 35, top: 64.5, bot: 82.5 },
        { x: 40, top: 64, bot: 83 },
        { x: 45, top: 64.5, bot: 82.5 },
        { x: 51, top: 65.5, bot: 81.5 },
        { x: 57, top: 67.5, bot: 79 },
        { x: 62, top: 70.5, bot: 75 },
      ].map((c, i) => (
        <line key={i} x1={c.x} x2={c.x} y1={c.top} y2={c.bot} stroke={bridge} strokeWidth="1.1" strokeLinecap="round" />
      ))}
    </svg>
  );
}
