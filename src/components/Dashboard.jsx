import { useEffect, useMemo, useState } from "react";
import { T } from "../theme.js";
import Btn from "./ui/Btn.jsx";
import { uploadKycDocument, authErrorMessage } from "../lib/auth.js";
import { fetchUserTransactions, retireTransaction } from "../lib/transactions.js";
import { downloadCertificate, downloadAllCertificates, downloadEsgReport } from "../lib/certificate.jsx";
import { showToast } from "../lib/toast.js";

const KYC_BADGES = {
  pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "KYC Pending" },
  approved: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", label: "KYC Approved" },
  rejected: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "KYC Rejected" },
};

const ROLE_LABELS = { buyer: "Buyer", seller: "Seller", business: "Business" };

// Per-spec equivalency multipliers (kept literal as requested — change here to retune):
const KM_PER_TONNE = 222;
const TREES_PER_TONNE = 0.12;

// 2070 net-zero progress is anchored to a personal annual offset target
// rather than India's 3 Gt national emissions (which would always be ~0%).
const NETZERO_TARGET_TONNES = 100;

export default function Dashboard({ user, setUser, setPage, walletDelta = [] }) {
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(null); // 'all' | 'esg' | null

  useEffect(() => {
    let mounted = true;
    if (!user?.id) return;
    setTxLoading(true);
    fetchUserTransactions(user.id)
      .then((data) => mounted && setTransactions(data))
      .finally(() => mounted && setTxLoading(false));
    return () => { mounted = false; };
  }, [user?.id, walletDelta.length]);

  if (!user) {
    return (
      <div className="fade" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 380 }}>
          <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 28, fontWeight: 900, marginBottom: 10 }}>You're not logged in</h1>
          <p style={{ color: T.text2, fontSize: 14, marginBottom: 22, lineHeight: 1.6 }}>Log in or create an account to access your wallet, retirements, and KYC status.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn onClick={() => setPage("login")}>Log in</Btn>
            <Btn variant="outline" onClick={() => setPage("register")}>Create account</Btn>
          </div>
        </div>
      </div>
    );
  }

  // Merge persisted + optimistic
  const seen = new Set(transactions.map((t) => t.cert_id));
  const inMemory = walletDelta
    .filter((w) => !seen.has(w.certId))
    .map((w) => ({
      id: w.certId, cert_id: w.certId, credit_name: w.creditName,
      qty: w.qty, total_inr: w.paidINR, payment_id: w.paymentId,
      registry: w.registry, created_at: w.date, retired: false,
      _icon: w.icon, _stub: true,
    }));
  const allTx = [...inMemory, ...transactions];

  // Portfolio metrics
  const totalCredits = useMemo(() => allTx.reduce((s, t) => s + (t.qty || 0), 0), [allTx]);
  const totalRetired = useMemo(() => allTx.filter((t) => t.retired).reduce((s, t) => s + (t.qty || 0), 0), [allTx]);
  const totalValueINR = useMemo(() => allTx.reduce((s, t) => s + Number(t.total_inr || 0), 0), [allTx]);
  const activeCount = useMemo(() => allTx.filter((t) => !t.retired).length, [allTx]);

  const kyc = KYC_BADGES[user.kyc_status] || KYC_BADGES.pending;
  const firstName = (user.name || user.email || user.phone || "").split(/\s+|@/)[0];

  const handleRetireAndDownload = async (rawItem) => {
    const certId = rawItem.cert_id || rawItem.certId;
    try {
      await retireTransaction(certId);
      setTransactions((prev) => prev.map((t) => (t.cert_id === certId ? { ...t, retired: true } : t)));
      showToast("Credit retired ✓ — generating certificate…");
      await downloadCertificate({ ...rawItem, retired: true }, user);
      showToast("Certificate downloaded 🌿");
    } catch (err) {
      showToast(err.message || "Could not retire credit.", "error", 6000);
    }
  };

  const handleDownload = async (rawItem) => {
    try {
      showToast("Generating certificate…", "info", 2500);
      await downloadCertificate(rawItem, user);
    } catch (err) {
      showToast(err.message || "Could not generate certificate.", "error", 6000);
    }
  };

  const handleDownloadAll = async () => {
    if (bulkBusy) return;
    if (allTx.length === 0) return showToast("Your wallet is empty.", "info");
    setBulkBusy("all");
    showToast(`Generating ${allTx.length}-certificate bundle…`, "info", 3000);
    try {
      const { count } = await downloadAllCertificates(allTx, user);
      showToast(`Downloaded ${count} certificate${count === 1 ? "" : "s"} as one PDF 🌿`);
    } catch (err) {
      showToast(err.message || "Could not generate the bundle.", "error", 6000);
    } finally {
      setBulkBusy(null);
    }
  };

  const handleEsgReport = async () => {
    if (bulkBusy) return;
    setBulkBusy("esg");
    showToast("Generating ESG report…", "info", 2500);
    try {
      await downloadEsgReport(allTx, user);
      showToast("ESG report downloaded 📊");
    } catch (err) {
      showToast(err.message || "Could not generate the ESG report.", "error", 6000);
    } finally {
      setBulkBusy(null);
    }
  };

  return (
    <div className="fade" style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px 80px" }}>
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, margin: 0, marginBottom: 8 }}>
          Welcome back, {firstName} 👋
        </h1>
        <p style={{ color: T.text2, fontSize: 15, margin: 0 }}>
          Signed in as <strong style={{ color: T.text1 }}>{user.email || user.phone}</strong> · {ROLE_LABELS[user.role] ?? user.role}
        </p>
      </div>

      {/* a) Portfolio Summary Card */}
      <PortfolioSummary
        totalCredits={totalCredits}
        totalRetired={totalRetired}
        totalValueINR={totalValueINR}
        activeCount={activeCount}
        kyc={kyc}
        kycSub={user.kyc_doc_url ? "Document submitted" : "Not yet submitted"}
      />

      {/* b) Quick Actions */}
      <QuickActions
        setPage={setPage}
        onDownloadAll={handleDownloadAll}
        onEsgReport={handleEsgReport}
        bulkBusy={bulkBusy}
        hasItems={allTx.length > 0}
      />

      {user.kyc_status === "pending" && !user.kyc_doc_url && (
        <KycPanel user={user} setUser={setUser} />
      )}

      {/* c) My Carbon Wallet */}
      <WalletPanel
        txs={allTx}
        loading={txLoading}
        setPage={setPage}
        onRetireAndDownload={handleRetireAndDownload}
        onDownload={handleDownload}
      />

      {/* d) Impact Visualization */}
      <ImpactVisualization totalCredits={totalCredits} />

      <ProfilePanel user={user} />
    </div>
  );
}

// =============================================================================
// (a) Portfolio Summary
// =============================================================================
function PortfolioSummary({ totalCredits, totalRetired, totalValueINR, activeCount, kyc, kycSub }) {
  return (
    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, padding: 24, marginBottom: 18, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 100% at 100% 0%, rgba(34,197,94,0.08), transparent)", pointerEvents: "none" }} />
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, gap: 8, flexWrap: "wrap" }}>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }}>Portfolio Summary</h3>
        <span style={{ fontSize: 11, color: T.text3, letterSpacing: 0.4, textTransform: "uppercase", fontWeight: 700 }}>Lifetime</span>
      </div>
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
        <Metric label="Total Credits Owned" value={totalCredits.toLocaleString("en-IN")} sub="tCO₂e in wallet" accent="#86efac" />
        <Metric label="Total CO₂ Offset" value={totalCredits.toLocaleString("en-IN")} sub={`${totalRetired.toLocaleString("en-IN")} retired`} accent="#34d399" />
        <Metric label="Total Value" value={`₹${totalValueINR.toLocaleString("en-IN")}`} sub="invested in INR" accent="#22c55e" />
        <Metric label="Active Certificates" value={activeCount.toLocaleString("en-IN")} sub={`KYC ${kyc.label.replace("KYC ", "").toLowerCase()}`} accent={kyc.color} />
      </div>
    </div>
  );
}

function Metric({ label, value, sub, accent }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 26, fontWeight: 900, color: accent || T.text1, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.text3 }}>{sub}</div>}
    </div>
  );
}

// =============================================================================
// (b) Quick Actions
// =============================================================================
function QuickActions({ setPage, onDownloadAll, onEsgReport, bulkBusy, hasItems }) {
  const actions = [
    { id: "browse", icon: "🛒", label: "Browse Marketplace", onClick: () => setPage("marketplace"), variant: "solid" },
    { id: "register", icon: "🌱", label: "Register My Project", onClick: () => setPage("sell"), variant: "outline" },
    { id: "all", icon: "📜", label: bulkBusy === "all" ? "⏳ Generating…" : "Download All Certs", onClick: onDownloadAll, variant: "outline", disabled: !hasItems || !!bulkBusy },
    { id: "esg", icon: "📊", label: bulkBusy === "esg" ? "⏳ Generating…" : "ESG Report PDF", onClick: onEsgReport, variant: "outline", disabled: !!bulkBusy },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 18 }}>
      {actions.map((a) => (
        <Btn key={a.id} variant={a.variant} onClick={a.onClick} disabled={a.disabled} style={{ width: "100%" }}>
          <span style={{ marginRight: 6 }}>{a.icon}</span>
          {a.label}
        </Btn>
      ))}
    </div>
  );
}

// =============================================================================
// (c) Wallet
// =============================================================================
function WalletPanel({ txs, loading, setPage, onRetireAndDownload, onDownload }) {
  return (
    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, padding: 24, marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }}>My Carbon Wallet</h3>
        <span style={{ fontSize: 12, color: T.text3 }}>{txs.length} transaction{txs.length === 1 ? "" : "s"}</span>
      </div>

      {loading && txs.length === 0 ? (
        <div style={{ padding: "30px 0", textAlign: "center", color: T.text3, fontSize: 13 }}>Loading wallet…</div>
      ) : txs.length === 0 ? (
        <div style={{ padding: "30px 0", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>🪪</div>
          <div style={{ fontSize: 14, color: T.text2, marginBottom: 14 }}>No credits yet — your purchases will appear here.</div>
          <Btn variant="outline" size="sm" onClick={() => setPage("marketplace")}>Browse marketplace</Btn>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {txs.map((t) => (
            <WalletRow key={t.id || t.cert_id} t={t} onRetireAndDownload={onRetireAndDownload} onDownload={onDownload} />
          ))}
        </div>
      )}
    </div>
  );
}

function WalletRow({ t, onRetireAndDownload, onDownload }) {
  const [busy, setBusy] = useState(null);
  const dt = (t.created_at || t.date) ? new Date(t.created_at || t.date) : null;
  const dateStr = dt ? dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const certId = t.cert_id || t.certId;
  const creditName = t.credit_name || t.creditName;
  const totalInr = t.total_inr ?? t.paidINR ?? 0;
  const isRetired = !!t.retired;
  const isStub = !!t._stub;

  const wrap = (key, fn) => async (...args) => {
    if (busy) return;
    setBusy(key);
    try { await fn(...args); } finally { setBusy(null); }
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "44px minmax(0,1.4fr) minmax(0,0.9fr) auto",
      alignItems: "center",
      gap: 14,
      padding: "14px 16px",
      background: T.bg1,
      border: `1px solid ${isRetired ? "rgba(148,163,184,0.3)" : "rgba(34,197,94,0.25)"}`,
      borderRadius: 14,
    }}>
      <div style={{ fontSize: 28, lineHeight: 1, textAlign: "center" }}>{t._icon || t.icon || "🌿"}</div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{creditName}</span>
          <StatusBadge isRetired={isRetired} isStub={isStub} />
        </div>
        <div style={{ fontSize: 11, color: T.text3, fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", letterSpacing: 0.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {certId} · {t.registry || "—"} · {dateStr}
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text1 }}>{(t.qty || 0).toLocaleString("en-IN")} tCO₂e</div>
        <div style={{ fontSize: 11, color: T.text3, marginTop: 3 }}>₹{Number(totalInr).toLocaleString("en-IN")}</div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Btn size="sm" variant="outline" onClick={wrap("download", () => onDownload(t))} disabled={busy !== null}>
          {busy === "download" ? "⏳ Generating…" : "📜 Download Certificate"}
        </Btn>
        {!isRetired && !isStub && (
          <Btn size="sm" variant="success" onClick={wrap("retire", () => onRetireAndDownload(t))} disabled={busy !== null}>
            {busy === "retire" ? "⏳ Retiring…" : "🔥 Retire Credits"}
          </Btn>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ isRetired, isStub }) {
  if (isStub) {
    return <Pill color="#fdba74" bg="rgba(251,146,60,0.12)" border="rgba(251,146,60,0.4)">Just bought</Pill>;
  }
  if (isRetired) {
    return <Pill color="#cbd5e1" bg="rgba(148,163,184,0.15)" border="rgba(148,163,184,0.4)">Retired</Pill>;
  }
  return <Pill color="#86efac" bg="rgba(34,197,94,0.12)" border="rgba(34,197,94,0.4)">Active</Pill>;
}

function Pill({ children, color, bg, border }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, color, background: bg,
      border: `1px solid ${border}`,
      padding: "2px 8px", borderRadius: 999, letterSpacing: 0.5,
      textTransform: "uppercase", flexShrink: 0,
    }}>
      {children}
    </span>
  );
}

// =============================================================================
// (d) Impact Visualization
// =============================================================================
function ImpactVisualization({ totalCredits }) {
  const km = Math.round(totalCredits * KM_PER_TONNE);
  const trees = totalCredits * TREES_PER_TONNE;
  const pct = Math.min(100, (totalCredits / NETZERO_TARGET_TONNES) * 100);

  return (
    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, padding: 24, marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }}>Your Climate Impact</h3>
        <span style={{ fontSize: 11, color: T.text3, letterSpacing: 0.4, textTransform: "uppercase", fontWeight: 700 }}>{totalCredits.toLocaleString("en-IN")} tCO₂e</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 22 }}>
        <Equiv icon="🚗" label="Car driving avoided" value={`${km.toLocaleString("en-IN")} km`} sub={`= ${totalCredits.toLocaleString("en-IN")} tCO₂e × ${KM_PER_TONNE}`} />
        <Equiv icon="🌳" label="Trees planted equivalent" value={trees.toLocaleString("en-IN", { maximumFractionDigits: 1 })} sub={`= ${totalCredits.toLocaleString("en-IN")} tCO₂e × ${TREES_PER_TONNE}`} />
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: T.text2, fontWeight: 600 }}>
            Your contribution to India's 2070 net-zero goal
          </span>
          <span style={{ fontSize: 12, color: "#86efac", fontWeight: 700, fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace" }}>
            {pct.toFixed(1)}%
          </span>
        </div>
        <div style={{ height: 10, background: T.bg1, borderRadius: 999, overflow: "hidden", border: `1px solid ${T.border}` }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, #22c55e 0%, #86efac 60%, #38bdf8 100%)",
            borderRadius: 999,
            transition: "width .4s ease",
          }} />
        </div>
        <div style={{ fontSize: 10, color: T.text3, marginTop: 6, lineHeight: 1.5 }}>
          Anchored to a {NETZERO_TARGET_TONNES}-tonne personal annual offset target. India aims for net-zero by 2070 — every credit you retire counts toward that goal.
        </div>
      </div>
    </div>
  );
}

function Equiv({ icon, label, value, sub }) {
  return (
    <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</span>
      </div>
      <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 900, color: T.text1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 10, color: T.text3, fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace" }}>{sub}</div>
    </div>
  );
}

// =============================================================================
// Profile + KYC (unchanged)
// =============================================================================
function ProfilePanel({ user }) {
  const rows = [
    { label: "Name", value: user.name || "—" },
    { label: "Email", value: user.email || "—" },
    { label: "Phone", value: user.phone || "—" },
    { label: "Company", value: user.company || "—" },
    { label: "Country", value: user.country },
  ];
  return (
    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, padding: 24, marginBottom: 16 }}>
      <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 17, fontWeight: 700, margin: 0, marginBottom: 16 }}>Profile</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
        {rows.map((r) => (
          <div key={r.label}>
            <div style={{ fontSize: 11, color: T.text3, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 4 }}>{r.label}</div>
            <div style={{ fontSize: 14, color: T.text1, wordBreak: "break-word" }}>{r.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KycPanel({ user, setUser }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return setError("Please pick a file first.");
    setError("");
    setUploading(true);
    try {
      const { url } = await uploadKycDocument(user.id, file, setProgress);
      setUploaded(true);
      setUser({ ...user, kyc_doc_url: url, kyc_status: "pending" });
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 18, padding: 24, marginBottom: 18 }}>
      <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 17, fontWeight: 700, margin: 0, marginBottom: 6, color: "#fbbf24" }}>Complete your KYC</h3>
      <p style={{ color: T.text2, fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
        Upload a PAN, Aadhaar, passport, or business registration certificate to unlock buying credits. Reviewed within 1 business day.
      </p>

      <label htmlFor="dash-kyc" style={{ display: "block", background: T.bg1, border: `2px dashed ${file ? "#22c55e" : T.border}`, borderRadius: 12, padding: 18, textAlign: "center", cursor: "pointer", marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{file ? `📄 ${file.name}` : "⬆️ Click to choose file"}</div>
        <div style={{ fontSize: 11, color: T.text3 }}>{file ? `${(file.size / 1024).toFixed(0)} KB` : "PDF / JPG / PNG · max 10 MB"}</div>
        <input id="dash-kyc" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setError(""); }} style={{ display: "none" }} disabled={uploading} />
      </label>

      {(uploading || uploaded) && (
        <div style={{ height: 6, background: T.bg1, borderRadius: 999, overflow: "hidden", border: `1px solid ${T.border}`, marginBottom: 8 }}>
          <div style={{ height: "100%", width: `${Math.round(progress * 100)}%`, background: "linear-gradient(90deg,#22c55e,#86efac)", transition: "width .25s ease" }} />
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5", borderRadius: 10, padding: 10, fontSize: 12, marginBottom: 10 }}>
          {error}
        </div>
      )}

      <Btn onClick={handleUpload} disabled={!file || uploading || uploaded} size="sm">
        {uploading ? "Uploading…" : uploaded ? "Submitted ✓" : "Upload document"}
      </Btn>
    </div>
  );
}
