import { useState } from "react";
import { T } from "../../App.jsx";

export default function Btn({
  children,
  onClick,
  variant = "solid",
  size = "md",
  type = "button",
  disabled = false,
  style = {},
}) {
  const [hov, setHov] = useState(false);

  const sizes = {
    sm: { padding: "8px 14px", fontSize: 13 },
    md: { padding: "11px 20px", fontSize: 14 },
    lg: { padding: "15px 28px", fontSize: 15 },
  };

  const base = {
    ...sizes[size] || sizes.md,
    fontFamily: "'Outfit',sans-serif",
    fontWeight: 700,
    borderRadius: 12,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all .2s ease",
    border: "1px solid transparent",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    letterSpacing: 0.2,
    opacity: disabled ? 0.55 : 1,
    whiteSpace: "nowrap",
  };

  const variants = {
    solid: {
      background: T.grad,
      color: "#04131a",
      transform: hov && !disabled ? "translateY(-1px)" : "none",
      boxShadow: hov && !disabled ? "0 8px 24px rgba(56,189,248,0.25)" : "none",
    },
    outline: {
      background: hov && !disabled ? "rgba(56,189,248,0.08)" : "transparent",
      color: T.text1,
      border: `1px solid ${hov && !disabled ? T.teal : "rgba(56,189,248,0.35)"}`,
    },
    ghost: {
      background: hov && !disabled ? "rgba(255,255,255,0.04)" : "transparent",
      color: T.text2,
    },
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      disabled={disabled}
      style={{ ...base, ...(variants[variant] || variants.solid), ...style }}
    >
      {children}
    </button>
  );
}
