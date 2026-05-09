import { useTranslation } from "react-i18next";
import { T } from "../../theme.js";
import { setLanguage } from "../../i18n/index.js";

export default function LangToggle({ size = "md" }) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("hi") ? "hi" : "en";

  const sizes = {
    sm: { padFY: 5, padFX: 10, font: 11 },
    md: { padFY: 6, padFX: 12, font: 13 },
  };
  const s = sizes[size] || sizes.md;

  const toggle = () => setLanguage(lang === "hi" ? "en" : "hi");

  const Item = ({ active, children }) => (
    <span
      style={{
        color: active ? "#86efac" : T.text3,
        fontWeight: active ? 800 : 600,
        transition: "color .2s",
      }}
    >
      {children}
    </span>
  );

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch language (current: ${lang === "hi" ? "Hindi" : "English"})`}
      title={lang === "hi" ? "Switch to English" : "Switch to Hindi · हिंदी में बदलें"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        background: "transparent",
        border: `1px solid ${T.border}`,
        borderRadius: 999,
        padding: `${s.padFY}px ${s.padFX}px`,
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: s.font,
        letterSpacing: 0.4,
        transition: "border-color .2s, background .2s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.06)"; e.currentTarget.style.borderColor = "rgba(34,197,94,0.35)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = T.border; }}
    >
      <Item active={lang === "hi"}>हिं</Item>
      <span style={{ color: T.text3, fontWeight: 400 }}>|</span>
      <Item active={lang === "en"}>EN</Item>
    </button>
  );
}
