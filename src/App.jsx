import { useEffect, useState } from "react";
import Home from "./components/Home.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import Marketplace from "./components/Marketplace.jsx";
import ForBusiness from "./components/ForBusiness.jsx";
import SellCredits from "./components/SellCredits.jsx";
import Login from "./components/Login.jsx";
import Btn from "./components/ui/Btn.jsx";
import Logo from "./components/ui/Logo.jsx";
import { CONTACT } from "./data/credits.js";

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
  brand: "#22c55e",
  brand2: "#86efac",
  grad: "linear-gradient(135deg, #38bdf8 0%, #34d399 100%)",
};

const NAV = [
  { id: "marketplace", label: "Marketplace" },
  { id: "howitworks", label: "How It Works" },
  { id: "business", label: "For Business" },
  { id: "sell", label: "Sell Credits" },
];

export default function App() {
  const [page, setPage] = useState(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    return hash || "home";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.history.replaceState(null, "", `#${page}`);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [page]);

  useEffect(() => {
    const onHash = () => setPage(window.location.hash.replace("#", "") || "home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const renderPage = () => {
    switch (page) {
      case "home":
        return <Home setPage={setPage} />;
      case "marketplace":
        return <Marketplace setPage={setPage} />;
      case "howitworks":
        return <HowItWorks setPage={setPage} />;
      case "business":
        return <ForBusiness setPage={setPage} />;
      case "sell":
        return <SellCredits setPage={setPage} />;
      case "login":
        return <Login setPage={setPage} mode="login" />;
      case "register":
        return <Login setPage={setPage} mode="register" />;
      default:
        return <Home setPage={setPage} />;
    }
  };

  return (
    <div style={{ background: T.bg0, color: T.text1, minHeight: "100vh", fontFamily: "'Inter',system-ui,-apple-system,sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;700;800;900&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .fade { animation: fade .4s ease; }
        @keyframes fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        a { color: inherit; }
        select option { color: ${T.text1}; }
      `}</style>

      <Header page={page} setPage={setPage} />
      <main style={{ flex: 1 }}>{renderPage()}</main>
      <Footer setPage={setPage} />
    </div>
  );
}

function Header({ page, setPage }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(4,8,15,0.78)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div onClick={() => setPage("home")} style={{ cursor: "pointer" }}>
          <Logo size={40} muted={T.text3} />
        </div>
        <nav style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              style={{
                background: page === n.id ? "rgba(34,197,94,0.12)" : "transparent",
                border: `1px solid ${page === n.id ? "rgba(34,197,94,0.35)" : "transparent"}`,
                color: page === n.id ? "#86efac" : T.text2,
                padding: "8px 14px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .2s",
              }}
            >
              {n.label}
            </button>
          ))}
          <div style={{ width: 1, height: 22, background: T.border, margin: "0 6px" }} />
          <Btn variant="outline" size="sm" onClick={() => setPage("login")}>Login</Btn>
          <Btn size="sm" onClick={() => setPage("register")}>Get Started</Btn>
        </nav>
      </div>
    </header>
  );
}

function Footer({ setPage }) {
  const cols = [
    {
      title: "Product",
      links: [
        { label: "Marketplace", id: "marketplace" },
        { label: "How It Works", id: "howitworks" },
        { label: "For Business", id: "business" },
        { label: "Sell Credits", id: "sell" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Get Started", id: "register" },
        { label: "Login", id: "login" },
      ],
    },
  ];

  return (
    <footer style={{ borderTop: `1px solid ${T.border}`, background: T.bg1, padding: "56px 24px 24px", marginTop: 40 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 40, marginBottom: 40 }}>
        <div>
          <Logo size={42} withTagline muted={T.text3} />
          <p style={{ color: T.text2, fontSize: 13, lineHeight: 1.7, marginTop: 16, maxWidth: 280 }}>
            The world's most trusted marketplace for verified carbon credits. Built by Nomad Life Corporation.
          </p>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14 }}>{col.title}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map((l) => (
                <button key={l.id} onClick={() => setPage(l.id)} style={{ background: "none", border: "none", color: T.text2, fontSize: 14, fontWeight: 500, cursor: "pointer", padding: 0, textAlign: "left", fontFamily: "inherit" }}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14 }}>Contact</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ContactRow icon="👤" value={CONTACT.founder} sub="Founder" />
            <ContactRow icon="✉️" value={CONTACT.email} href={`mailto:${CONTACT.email}`} />
            <ContactRow icon="📞" value={CONTACT.phone} href={`tel:${CONTACT.phoneRaw}`} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", paddingTop: 22, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 12, color: T.text3 }}>© {new Date().getFullYear()} Nomad Life Corporation. All rights reserved.</span>
        <span style={{ fontSize: 12, color: T.text3 }}>🌍 Building a net-zero world, one credit at a time.</span>
      </div>
    </footer>
  );
}

function ContactRow({ icon, value, sub, href }) {
  const content = (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ fontSize: 14, lineHeight: "20px" }}>{icon}</span>
      <div>
        <div style={{ fontSize: 14, color: T.text1, fontWeight: 500, wordBreak: "break-word" }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: T.text3, marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
  return href ? <a href={href} style={{ textDecoration: "none" }}>{content}</a> : content;
}
