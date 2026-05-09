import { useEffect, useRef, useState } from "react";
import { T } from "../../theme.js";

/**
 * 6-box OTP input.
 *
 * - Numeric only (mobile shows numeric keyboard via inputMode="numeric")
 * - Types a digit → auto-focus next box
 * - Backspace on empty → focus previous box
 * - Paste a 6-digit code → distributes across boxes
 * - When all boxes filled → calls onComplete(code)
 * - Calls onChange(currentString) on every change
 */
export default function OtpInput({ length = 6, value, onChange, onComplete, disabled, autoFocus = true }) {
  const [digits, setDigits] = useState(() => normalize(value, length));
  const refs = useRef([]);

  // Sync external value (e.g. when parent clears it)
  useEffect(() => {
    if (value === undefined || value === null) return;
    setDigits(normalize(value, length));
  }, [value, length]);

  useEffect(() => {
    if (autoFocus) {
      const idx = digits.findIndex((d) => !d);
      refs.current[idx === -1 ? length - 1 : idx]?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (next) => {
    setDigits(next);
    const str = next.join("");
    onChange?.(str);
    if (next.every((d) => d !== "")) onComplete?.(str);
  };

  const handleChange = (i, raw) => {
    const v = raw.replace(/\D/g, "").slice(-1); // last digit only
    if (raw !== "" && v === "") return;
    const next = [...digits];
    next[i] = v;
    update(next);
    if (v && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = [...digits];
        next[i] = "";
        update(next);
      } else if (i > 0) {
        const next = [...digits];
        next[i - 1] = "";
        update(next);
        refs.current[i - 1]?.focus();
      }
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      refs.current[i + 1]?.focus();
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    const text = (e.clipboardData?.getData("text") || "").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    e.preventDefault();
    const next = Array(length).fill("");
    text.split("").forEach((c, i) => { next[i] = c; });
    update(next);
    refs.current[Math.min(text.length, length - 1)]?.focus();
  };

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          onFocus={(e) => e.target.select()}
          style={{
            width: 44,
            height: 52,
            background: T.bg1,
            border: `1.5px solid ${d ? "#22c55e" : T.border}`,
            color: T.text1,
            fontSize: 22,
            fontWeight: 700,
            fontFamily: "inherit",
            textAlign: "center",
            borderRadius: 12,
            outline: "none",
            transition: "border-color .15s, transform .15s",
            opacity: disabled ? 0.55 : 1,
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
      ))}
    </div>
  );
}

function normalize(value, length) {
  const out = Array(length).fill("");
  if (!value) return out;
  String(value).replace(/\D/g, "").slice(0, length).split("").forEach((c, i) => { out[i] = c; });
  return out;
}
