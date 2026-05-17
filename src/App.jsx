import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Home from "./components/Home.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import Marketplace from "./components/Marketplace.jsx";
import ForBusiness from "./components/ForBusiness.jsx";
import SellCredits from "./components/SellCredits.jsx";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Checkout from "./components/Checkout.jsx";
import Methodologies from "./components/Methodologies.jsx";
import Btn from "./components/ui/Btn.jsx";
import Logo from "./components/ui/Logo.jsx";
import ToastHost from "./components/ui/Toast.jsx";
import LangToggle from "./components/ui/LangToggle.jsx";
import Ticker from "./components/ui/Ticker.jsx";
import { setLanguage } from "./i18n/index.js";
import { CONTACT, BRAND } from "./data/credits.js";
import { supabase, isSupabaseConfigured } from "./lib/supabase.js";
import { fetchAndSetUser, signOut } from "./lib/auth.js";
import { showToast } from "./lib/toast.js";
import { T } from "./theme.js";

// Re-export T from App.jsx for backwards compatibility with components
// that already do `import { T } from "../App.jsx"`. Source of truth is theme.js.
export { T };

const NAV_KEYS = [
  { id: "marketplace",    tk: "nav.marketplace" },
  { id: "methodologies",  tk: "nav.methodologies" },
  { id: "howitworks",     tk: "nav.howItWorks" },
  { id: "business",       tk: "nav.forBusiness" },
  { id: "sell",           tk: "nav.sellCredits" },
];

export default function App() {
  const [page, setPage] = useState(() => {
    const hash = typeof window !== "undefined" ? window.location.hash.replace("#", "") : "";
    return hash || "home";
  });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [checkout, setCheckout] = useState(null);     // { credit, qty }
  const [walletDelta, setWalletDelta] = useState([]); // newly bought, optimistic

  // ----- Hash-based routing (unchanged) -----
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

  // ----- Sync UI language to user profile when logged in -----
  useEffect(() => {
    if (user?.language && (user.language === "en" || user.language === "hi")) {
      setLanguage(user.language);
    }
  }, [user?.language]);

  // ----- Session bootstrap + onAuthStateChange listener -----
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        fetchAndSetUser(session.user.id, setUser, session.user).finally(() => {
          if (mounted) setAuthLoading(false);
        });
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (session?.user) {
        fetchAndSetUser(session.user.id, setUser, session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await signOut(setUser);
    setCheckout(null);
    setWalletDelta([]);
    setPage("home");
  };

  const handleBuy = (credit) => {
    setCheckout({ credit, qty: 1 });
    setPage("checkout");
  };

  const handlePurchased = (walletItem) => {
    setWalletDelta((prev) => [walletItem, ...prev]);
  };

  const renderPage = () => {
    switch (page) {
      case "home":
        return <Home setPage={setPage} />;
      case "marketplace":
        return <Marketplace setPage={setPage} onBuy={handleBuy} />;
      case "methodologies":
        return <Methodologies setPage={setPage} />;
      case "howitworks":
        return <HowItWorks setPage={setPage} />;
      case "business":
        return <ForBusiness setPage={setPage} />;
      case "sell":
        return <SellCredits setPage={setPage} />;
      case "login":
        return user ? <Dashboard user={user} setUser={setUser} setPage={setPage} walletDelta={walletDelta} /> : <Login setPage={setPage} setUser={setUser} mode="login" />;
      case "register":
        return user ? <Dashboard user={user} setUser={setUser} setPage={setPage} walletDelta={walletDelta} /> : <Login setPage={setPage} setUser={setUser} mode="register" />;
      case "dashboard":
        return <Dashboard user={user} setUser={setUser} setPage={setPage} walletDelta={walletDelta} />;
      case "checkout":
        return <Checkout checkout={checkout} setCheckout={setCheckout} user={user} setPage={setPage} onPurchased={handlePurchased} />;
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

      <Header page={page} setPage={setPage} user={user} authLoading={authLoading} onSignOut={handleSignOut} />
      <Ticker />
      <main style={{ flex: 1 }}>{renderPage()}</main>
      <Footer setPage={setPage} />
      <ToastHost />
    </div>
  );
}

function Header({ page, setPage, user, authLoading, onSignOut }) {
  const { t } = useTranslation();
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(4,8,15,0.78)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div onClick={() => setPage("home")} style={{ cursor: "pointer" }}>
          <Logo size={40} muted={T.text3} />
        </div>
        <nav style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
          {NAV_KEYS.map((n) => (
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
              {t(n.tk)}
            </button>
          ))}
          <div style={{ width: 1, height: 22, background: T.border, margin: "0 6px" }} />
          <LangToggle size="sm" />
          {authLoading ? (
            <div style={{ width: 90, height: 32, borderRadius: 10, background: T.bg2, opacity: 0.5 }} />
          ) : user ? (
            <UserMenu user={user} setPage={setPage} onSignOut={onSignOut} />
          ) : (
            <>
              <Btn variant="outline" size="sm" onClick={() => setPage("login")}>{t("nav.login")}</Btn>
              <Btn size="sm" onClick={() => setPage("register")}>{t("nav.getStarted")}</Btn>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function UserMenu({ user, setPage, onSignOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  const initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();
  const display = user.name || user.email.split("@")[0];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 9,
          background: open ? "rgba(34,197,94,0.12)" : T.bg2,
          border: `1px solid ${open ? "rgba(34,197,94,0.35)" : T.border}`,
          color: T.text1,
          padding: "5px 12px 5px 5px",
          borderRadius: 999,
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 13,
          fontWeight: 600,
          transition: "all .2s",
        }}
      >
        <span style={{
          width: 26, height: 26, borderRadius: 999,
          background: "linear-gradient(135deg,#22c55e,#15803d)",
          color: "#04131a",
          fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 13,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
        }}>{initial}</span>
        <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{display}</span>
        <span style={{ fontSize: 9, color: T.text3, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: 220,
          background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14,
          padding: 6, boxShadow: "0 12px 40px rgba(0,0,0,0.4)", zIndex: 60,
        }}>
          <div style={{ padding: "10px 12px 12px", borderBottom: `1px solid ${T.border}`, marginBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text1 }}>{user.name || "Carbon Bridge user"}</div>
            <div style={{ fontSize: 11, color: T.text3, marginTop: 2, wordBreak: "break-all" }}>{user.email}</div>
            <div style={{ fontSize: 10, color: "#86efac", marginTop: 6, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
              {user.role} · KYC {user.kyc_status}
            </div>
          </div>
          <MenuItem onClick={() => { setOpen(false); setPage("dashboard"); }}>📊 Dashboard</MenuItem>
          <MenuItem onClick={() => { setOpen(false); setPage("marketplace"); }}>🛒 Marketplace</MenuItem>
          <div style={{ height: 1, background: T.border, margin: "4px 0" }} />
          <SignOutMenuItem onSelect={() => { setOpen(false); onSignOut(); }} />
        </div>
      )}
    </div>
  );
}

function SignOutMenuItem({ onSelect }) {
  const { t } = useTranslation();
  return <MenuItem onClick={onSelect} danger>↩ {t("nav.signOut")}</MenuItem>;
}

function MenuItem({ children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        background: "none",
        border: "none",
        color: danger ? "#fca5a5" : T.text2,
        padding: "9px 12px",
        borderRadius: 9,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 500,
        fontFamily: "inherit",
        transition: "background .15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
    >
      {children}
    </button>
  );
}

function Footer({ setPage }) {
  const cols = [
    {
      title: "Product",
      links: [
        { label: "Marketplace", id: "marketplace" },
        { label: "Methodologies", id: "methodologies" },
        { label: "How It Works", id: "howitworks" },
        { label: "For Business", id: "business" },
        { label: "Sell Credits", id: "sell" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Dashboard", id: "dashboard" },
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
          <p style={{ color: T.text2, fontSize: 13, lineHeight: 1.7, marginTop: 16, maxWidth: 320 }}>
            India's first environmental credit marketplace — Carbon · Soil · Plastic · CBG · Biogas. Built by {BRAND.company}.
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
        <span style={{ fontSize: 12, color: T.text3 }}>© {new Date().getFullYear()} {BRAND.company}. All rights reserved.</span>
        <span style={{ fontSize: 12, color: T.text3 }}>🇮🇳 Building India's net-zero economy, one credit at a time.</span>
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
