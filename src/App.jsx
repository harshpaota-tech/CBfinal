import { useState } from "react";
import Home from "./components/Home.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import Btn from "./components/ui/Btn.jsx";

export const T = {
  bg0: "#04080f",
  bg1: "#070d18",
  bg2: "#0d1525",
  border: "rgba(56,189,248,0.12)",
  text1: "#e6f1ff",
  text2: "#9fb3c8",
  text3: "#5d7290",
  teal: "#38bdf8",
  green: "#34d399",
  grad: "linear-gradient(135deg, #38bdf8 0%, #34d399 100%)",
};

const NAV = [
  { id: "home", label: "Home" },
  { id: "marketplace", label: "Marketplace" },
  { id: "howitworks", label: "How It Works" },
  { id: "register", label: "Sign Up" },
];

function Placeholder({ title, subtitle, setPage }) {
  return (
    <div className="fade" style={{ minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 24px" }}>
      <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 44, fontWeight: 900, marginBottom: 16, background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{title}</h1>
      <p style={{ color: T.text2, fontSize: 16, maxWidth: 520, lineHeight: 1.7, marginBottom: 28 }}>{subtitle}</p>
      <Btn onClick={() => setPage("home")}>← Back to Home</Btn>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");

  const renderPage = () => {
    switch (page) {
      case "home":
        return <Home setPage={setPage} />;
      case "howitworks":
        return <HowItWorks setPage={setPage} />;
      case "marketplace":
        return (
          <Placeholder
            title="Marketplace"
            subtitle="Browse verified carbon credits from Verra, Gold Standard and ACR registries. Marketplace coming online soon."
            setPage={setPage}
          />
        );
      case "register":
        return (
          <Placeholder
            title="Create Your Account"
            subtitle="Account registration is being wired up. KYC and onboarding will be available shortly."
            setPage={setPage}
          />
        );
      default:
        return <Home setPage={setPage} />;
    }
  };

  return (
    <div style={{ background: T.bg0, color: T.text1, minHeight: "100vh", fontFamily: "'Inter',system-ui,-apple-system,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .fade { animation: fade .4s ease; }
        @keyframes fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      `}</style>

      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(4,8,15,0.78)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div onClick={() => setPage("home")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🌉</div>
            <div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 17, background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CarbonBridge</div>
              <div style={{ fontSize: 9, color: T.text3, marginTop: -2 }}>by Nomad Life Corporation</div>
            </div>
          </div>
          <nav style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                style={{
                  background: page === n.id ? "rgba(56,189,248,0.12)" : "transparent",
                  border: `1px solid ${page === n.id ? "rgba(56,189,248,0.35)" : "transparent"}`,
                  color: page === n.id ? T.teal : T.text2,
                  padding: "8px 14px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main>{renderPage()}</main>
    </div>
  );
}
