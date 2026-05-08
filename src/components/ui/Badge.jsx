export default function Badge({ children, color = "#38bdf8", style = {} }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: `${color}1f`,
        color: color,
        border: `1px solid ${color}55`,
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.4,
        textTransform: "uppercase",
        fontFamily: "'Outfit',sans-serif",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
