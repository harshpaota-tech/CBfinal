import { useEffect, useState } from "react";
import { T } from "../theme.js";
import Btn from "./ui/Btn.jsx";
import { uploadKycDocument, authErrorMessage } from "../lib/auth.js";
import { fetchUserTransactions, retireTransaction } from "../lib/transactions.js";
import { downloadCertificate } from "../lib/certificate.jsx";
import { showToast } from "../lib/toast.js";
import { formatINR } from "../data/credits.js";

const KYC_BADGES = {
  pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "KYC Pending" },
  approved: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", label: "KYC Approved" },
  rejected: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "KYC Rejected" },
};

const ROLE_LABELS = { buyer: "Buyer", seller: "Seller", business: "Business" };

export default function Dashboard({ user, setUser, setPage, walletDelta = [] }) {
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  // Fetch the user's purchases on mount + whenever a new purchase is recorded.
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

  // Merge persisted transactions with optimistically-added in-memory ones (so
  // the Wallet shows the new credit instantly even before Supabase round-trip).
  const seen = new Set(transactions.map((t) => t.cert_id));
  const inMemory = walletDelta
    .filter((w) => !seen.has(w.certId))
    .map((w) => ({
      id: w.certId,
      cert_id: w.certId,
      credit_name: w.creditName,
      qty: w.qty,
      total_inr: w.paidINR,
      payment_id: w.paymentId,
      registry: w.registry,
      created_at: w.date,
      retired: false,
      _icon: w.icon,
      _stub: true,
    }));
  const allTx = [...inMemory, ...transactions];

  const totalCredits = allTx.filter((t) => !t.retired).reduce((s, t) => s + (t.qty || 0), 0);
  const totalRetired = allTx.filter((t) => t.retired).reduce((s, t) => s + (t.qty || 0), 0);
  const totalSpentINR = allTx.reduce((s, t) => s + Number(t.total_inr || 0), 0);

  const kyc = KYC_BADGES[user.kyc_status] || KYC_BADGES.pending;
  const firstName = (user.name || user.email || "").split(/\s+|@/)[0];

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

  return (
    <div className="fade" style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px 80px" }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(28px,4vw,40px)", fontWeight: 900, margin: 0, marginBottom: 8 }}>
          Welcome back, {firstName} 👋
        </h1>
        <p style={{ color: T.text2, fontSize: 15, margin: 0 }}>
          Signed in as <strong style={{ color: T.text1 }}>{user.email}</strong> · {ROLE_LABELS[user.role] ?? user.role}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Active credits" value={totalCredits.toLocaleString("en-IN")} sub="tCO₂e in wallet" />
        <StatCard label="Retired credits" value={totalRetired.toLocaleString("en-IN")} sub="tCO₂e offset" />
        <StatCard label="Total spent" value={`₹${totalSpentINR.toLocaleString("en-IN")}`} sub={`${allTx.length} transactions`} />
        <StatCard label="KYC status" value={kyc.label} valueColor={kyc.color} valueBg={kyc.bg} sub={user.kyc_doc_url ? "Document submitted" : "Not yet submitted"} />
      </div>

      {user.kyc_status === "pending" && !user.kyc_doc_url && (
        <KycPanel user={user} setUser={setUser} />
      )}

      <WalletPanel txs={allTx} loading={txLoading} setPage={setPage} onRetireAndDownload={handleRetireAndDownload} onDownload={handleDownload} />

      <ProfilePanel user={user} />

      <div style={{ marginTop: 28, padding: "32px 28px", background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 18, textAlign: "center" }}>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Want to offset more?</h3>
        <p style={{ color: T.text2, fontSize: 14, marginBottom: 20 }}>8 verified projects across 6 Indian states — buy credits in INR.</p>
        <Btn onClick={() => setPage("marketplace")}>Browse marketplace →</Btn>
      </div>
    </div>
  );
}

function WalletPanel({ txs, loading, setPage, onRetireAndDownload, onDownload }) {
  return (
    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, padding: 24, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }}>Wallet & Certificates</h3>
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
          {txs.map((t) => <WalletRow key={t.id || t.cert_id} t={t} onRetireAndDownload={onRetireAndDownload} onDownload={onDownload} />)}
        </div>
      )}
    </div>
  );
}

function WalletRow({ t, onRetireAndDownload, onDownload }) {
  const [busy, setBusy] = useState(null); // 'download' | 'retire' | null
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

  const handleDownload = wrap("download", () => onDownload(t));
  const handleRetireAndDownload = wrap("retire", () => onRetireAndDownload(t));

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "44px minmax(0,1.4fr) minmax(0,0.9fr) auto",
      alignItems: "center",
      gap: 14,
      padding: "14px 16px",
      background: T.bg1,
      border: `1px solid ${isRetired ? "rgba(34,197,94,0.3)" : T.border}`,
      borderRadius: 14,
    }}>
      <div style={{ fontSize: 28, lineHeight: 1, textAlign: "center" }}>{t._icon || t.icon || "🌿"}</div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{creditName}</span>
          {isRetired && (
            <span style={{ fontSize: 9, fontWeight: 800, color: "#86efac", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.4)", padding: "2px 7px", borderRadius: 999, letterSpacing: 0.5, textTransform: "uppercase", flexShrink: 0 }}>Retired ✓</span>
          )}
          {isStub && !isRetired && (
            <span style={{ fontSize: 9, fontWeight: 800, color: "#fdba74", background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.35)", padding: "2px 7px", borderRadius: 999, letterSpacing: 0.5, textTransform: "uppercase", flexShrink: 0 }}>Just bought</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: T.text3, fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", letterSpacing: 0.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {certId} · {dateStr}
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text1 }}>{(t.qty || 0).toLocaleString("en-IN")} tCO₂e</div>
        <div style={{ fontSize: 11, color: T.text3, marginTop: 3 }}>₹{Number(totalInr).toLocaleString("en-IN")}</div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
        <Btn size="sm" variant="outline" onClick={handleDownload} disabled={busy !== null}>
          {busy === "download" ? "⏳ Generating…" : "📜 Download Certificate"}
        </Btn>
        {!isRetired && !isStub && (
          <Btn size="sm" variant="success" onClick={handleRetireAndDownload} disabled={busy !== null}>
            {busy === "retire" ? "⏳ Retiring…" : "🔥 Retire & Download"}
          </Btn>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, valueColor, valueBg }) {
  return (
    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: "20px 22px" }}>
      <div style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
      <div style={{
        fontFamily: "'Outfit',sans-serif",
        fontSize: 22,
        fontWeight: 800,
        color: valueColor || T.text1,
        background: valueBg,
        display: valueBg ? "inline-block" : "block",
        padding: valueBg ? "4px 12px" : 0,
        borderRadius: valueBg ? 999 : 0,
        marginBottom: 6,
      }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: T.text3 }}>{sub}</div>}
    </div>
  );
}

function ProfilePanel({ user }) {
  const rows = [
    { label: "Name", value: user.name || "—" },
    { label: "Email", value: user.email },
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
    <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 18, padding: 24, marginBottom: 16 }}>
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
