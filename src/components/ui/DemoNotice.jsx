import { useTranslation } from "react-i18next";

/**
 * Demo / disclaimer notice. Used in two layouts:
 *
 *   <DemoNotice variant="strip" />   thin always-visible warning under the
 *                                    ticker — short copy
 *   <DemoNotice variant="block" />   full block above the footer columns —
 *                                    detailed copy with the legal disclaimer
 *
 * Both pull copy from i18n so they switch with the language toggle.
 */
export default function DemoNotice({ variant = "block", total, indiaCount, stateCount, intlCount }) {
  const { t } = useTranslation();

  if (variant === "marketplace") {
    return (
      <div style={{
        background: "linear-gradient(90deg, rgba(245,158,11,0.16) 0%, rgba(245,158,11,0.08) 100%)",
        border: "1px solid rgba(245,158,11,0.45)",
        borderRadius: 18,
        color: "#fde68a",
        padding: "18px 22px",
        marginBottom: 28,
      }}>
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(245,158,11,0.22)",
            color: "#fbbf24",
            border: "1px solid rgba(245,158,11,0.55)",
            borderRadius: 999,
            padding: "5px 12px",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 0.6,
            textTransform: "uppercase",
          }}>
            ⚠️ {t("demo.tag")}
          </div>
          <div style={{ flex: "1 1 280px", minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fbbf24", marginBottom: 6 }}>
              {t("demo.marketplaceTitle")}
            </div>
            <p style={{ fontSize: 13, color: "#fde68a", lineHeight: 1.65, margin: 0 }}>
              {t("demo.marketplaceBody", { total, indiaCount, stateCount, intlCount })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "strip") {
    return (
      <div style={{
        background: "linear-gradient(90deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.08) 100%)",
        borderBottom: "1px solid rgba(245,158,11,0.4)",
        color: "#fbbf24",
        padding: "6px 24px",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.4,
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexWrap: "wrap",
      }}>
        <span aria-hidden style={{ fontSize: 13 }}>⚠️</span>
        <span style={{ textTransform: "uppercase" }}>{t("demo.tag")}</span>
        <span style={{ color: "#fde68a", fontWeight: 500, textTransform: "none", letterSpacing: 0 }}>
          — {t("demo.shortNotice")}
        </span>
      </div>
    );
  }

  // Block variant (footer)
  return (
    <div style={{
      background: "linear-gradient(90deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.06) 100%)",
      borderTop: "1px solid rgba(245,158,11,0.35)",
      borderBottom: "1px solid rgba(245,158,11,0.35)",
      padding: "20px 24px",
      marginBottom: 40,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(245,158,11,0.18)",
          color: "#fbbf24",
          border: "1px solid rgba(245,158,11,0.5)",
          borderRadius: 999,
          padding: "5px 12px",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 0.6,
          textTransform: "uppercase",
        }}>
          ⚠️ {t("demo.tag")}
        </div>
        <div style={{ flex: "1 1 320px", minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fbbf24", marginBottom: 4 }}>
            {t("demo.title")}
          </div>
          <p style={{ fontSize: 12, color: "#fde68a", lineHeight: 1.6, margin: 0 }}>
            {t("demo.body")}
          </p>
        </div>
      </div>
    </div>
  );
}
