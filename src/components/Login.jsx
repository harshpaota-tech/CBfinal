import { useState } from "react";
import { T } from "../App.jsx";
import Btn from "./ui/Btn.jsx";

export default function Login({ setPage, mode = "login" }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitted, setSubmitted] = useState(false);

  const handle = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fade" style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
      <div style={{ width: "100%", maxWidth: 420, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 22, padding: 32 }}>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 6, textAlign: "center" }}>
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p style={{ color: T.text2, fontSize: 14, marginBottom: 26, textAlign: "center" }}>
          {isRegister ? "Start offsetting in under 5 minutes." : "Log in to manage your wallet and retirements."}
        </p>

        {submitted ? (
          <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.35)", borderRadius: 14, padding: 18, color: T.green, fontSize: 14, textAlign: "center", marginBottom: 18 }}>
            ✅ Thanks! Authentication will go live with the backend launch. We'll email you when it's ready.
          </div>
        ) : (
          <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {isRegister && (
              <Field label="Full name" type="text" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Jane Doe" required />
            )}
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@company.com" required />
            <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="••••••••" required />
            <div style={{ marginTop: 8 }}>
              <Btn type="submit" style={{ width: "100%" }}>
                {isRegister ? "Create account" : "Log in"}
              </Btn>
            </div>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: T.text2 }}>
          {isRegister ? (
            <>Already have an account?{" "}
              <button onClick={() => setPage("login")} style={linkStyle}>Log in</button>
            </>
          ) : (
            <>New to CarbonBridge?{" "}
              <button onClick={() => setPage("register")} style={linkStyle}>Create account</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const linkStyle = {
  background: "none",
  border: "none",
  color: "#38bdf8",
  fontWeight: 700,
  cursor: "pointer",
  fontSize: 13,
  fontFamily: "inherit",
  padding: 0,
};

function Field({ label, type, value, onChange, placeholder, required }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, color: T.text3, fontWeight: 600, letterSpacing: 0.3 }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          background: T.bg1,
          border: `1px solid ${T.border}`,
          color: T.text1,
          fontSize: 14,
          padding: "12px 14px",
          borderRadius: 12,
          outline: "none",
          fontFamily: "inherit",
        }}
      />
    </label>
  );
}
