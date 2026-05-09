import { useEffect, useState } from "react";
import { T } from "../../theme.js";
import { subscribeToast } from "../../lib/toast.js";

const COLORS = {
  success: { fg: "#86efac", bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.4)", icon: "✓" },
  error: { fg: "#fca5a5", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.4)", icon: "✕" },
  info: { fg: "#7dd3fc", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.4)", icon: "i" },
};

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    return subscribeToast(({ message, type, durationMs }) => {
      const id = Math.random().toString(36).slice(2, 8);
      setToasts((curr) => [...curr, { id, message, type, durationMs }]);
      setTimeout(() => {
        setToasts((curr) => curr.filter((t) => t.id !== id));
      }, durationMs);
    });
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 80,
      right: 20,
      display: "flex",
      flexDirection: "column",
      gap: 10,
      zIndex: 100,
      maxWidth: "calc(100vw - 40px)",
      pointerEvents: "none",
    }}>
      <style>{`
        @keyframes cb-toast-in { from { transform: translateX(20px); opacity: 0; } to { transform: none; opacity: 1; } }
      `}</style>
      {toasts.map((t) => {
        const c = COLORS[t.type] || COLORS.info;
        return (
          <div
            key={t.id}
            style={{
              background: T.bg2,
              border: `1px solid ${c.border}`,
              borderLeft: `4px solid ${c.border}`,
              borderRadius: 12,
              padding: "12px 16px",
              minWidth: 260,
              maxWidth: 380,
              display: "flex",
              alignItems: "center",
              gap: 12,
              boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
              animation: "cb-toast-in .25s ease",
              pointerEvents: "auto",
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 999,
              background: c.bg, color: c.fg,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 900, flexShrink: 0,
            }}>{c.icon}</div>
            <div style={{ fontSize: 13, color: T.text1, lineHeight: 1.45 }}>{t.message}</div>
          </div>
        );
      })}
    </div>
  );
}
