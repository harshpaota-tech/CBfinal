import { useState } from "react";
import { T } from "../App.jsx";
import Btn from "./ui/Btn.jsx";
import { uploadKycDocument, authErrorMessage } from "../lib/auth.js";
import { formatINR } from "../data/credits.js";

const KYC_BADGES = {
  pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", label: "KYC Pending" },
  approved: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", label: "KYC Approved" },
  rejected: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "KYC Rejected" },
};

const ROLE_LABELS = { buyer: "Buyer", seller: "Seller", business: "Business" };

export default function Dashboard({ user, setUser, setPage }) {
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

  const kyc = KYC_BADGES[user.kyc_status] || KYC_BADGES.pending;
  const firstName = (user.name || user.email || "").split(/\s+|@/)[0];

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard label="Wallet balance" value={formatINR(user.wallet_balance / 83.5)} sub={`${user.wallet_balance.toLocaleString("en-IN")} INR`} />
        <StatCard label="Account type" value={ROLE_LABELS[user.role] ?? "—"} sub={user.country === "IN" ? "🇮🇳 India" : user.country} />
        <StatCard label="KYC status" value={kyc.label} valueColor={kyc.color} valueBg={kyc.bg} sub={user.kyc_doc_url ? "Document submitted" : "Not yet submitted"} />
      </div>

      {user.kyc_status === "pending" && !user.kyc_doc_url && (
        <KycPanel user={user} setUser={setUser} />
      )}

      <ProfilePanel user={user} />

      <div style={{ marginTop: 28, padding: "32px 28px", background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 18, textAlign: "center" }}>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Ready to start offsetting?</h3>
        <p style={{ color: T.text2, fontSize: 14, marginBottom: 20 }}>Browse 8 verified projects across 6 Indian states.</p>
        <Btn onClick={() => setPage("marketplace")}>Browse marketplace →</Btn>
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
