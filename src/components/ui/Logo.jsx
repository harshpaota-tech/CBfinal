export default function Logo({ size = 36, withText = true, withTagline = false, accent = "#cbd5f5", muted = "#5d7290" }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
        aria-label="CarbonBridge logo"
      >
        <defs>
          <linearGradient id="cb-globe" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <linearGradient id="cb-leaf" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#86efac" />
          </linearGradient>
          <linearGradient id="cb-bridge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#15803d" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>
          <clipPath id="cb-globe-clip">
            <circle cx="40" cy="42" r="24" />
          </clipPath>
        </defs>

        <circle cx="40" cy="42" r="24" fill="none" stroke="url(#cb-globe)" strokeWidth="3" />

        <g clipPath="url(#cb-globe-clip)" fill="#16a34a" opacity="0.9">
          <path d="M22 32 Q30 28 38 31 Q44 34 50 30 Q56 28 60 32 L62 40 Q56 44 48 41 Q40 38 32 42 Q26 44 22 40 Z" />
          <path d="M28 50 Q38 53 48 49 L52 56 Q44 60 36 58 Q30 56 26 56 Z" />
          <path d="M52 52 Q58 50 62 54 L60 60 Q56 60 52 58 Z" />
        </g>

        <g clipPath="url(#cb-globe-clip)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" fill="none">
          <ellipse cx="40" cy="42" rx="24" ry="9" />
          <line x1="40" y1="18" x2="40" y2="66" />
        </g>

        <path d="M62 28 Q74 16 82 18 Q80 30 70 38 Q60 40 62 30 Z" fill="url(#cb-leaf)" />
        <path d="M64 32 Q72 26 80 22" stroke="#15803d" strokeWidth="1" fill="none" strokeLinecap="round" />

        <path d="M14 76 Q40 88 66 76" fill="none" stroke="url(#cb-bridge)" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="22" y1="78" x2="22" y2="84" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
        <line x1="40" y1="82" x2="40" y2="86" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
        <line x1="58" y1="78" x2="58" y2="84" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {withText && (
        <div style={{ lineHeight: 1.05 }}>
          <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: Math.round(size * 0.5), letterSpacing: 0.3, whiteSpace: "nowrap" }}>
            <span style={{ color: "#16a34a" }}>Carbon</span>
            <span style={{ color: "#86efac" }}>Bridge</span>
          </div>
          <div style={{ fontSize: Math.max(8, Math.round(size * 0.22)), color: muted, marginTop: 2, fontWeight: 500, letterSpacing: 0.4 }}>
            {withTagline ? "Bridging today, sustaining tomorrow" : `by Nomad Life Corporation`}
          </div>
        </div>
      )}
    </div>
  );
}
