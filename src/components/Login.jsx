import { useEffect, useRef, useState } from "react";
import { T } from "../App.jsx";
import Btn from "./ui/Btn.jsx";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  resendVerificationEmail,
  uploadKycDocument,
  authErrorMessage,
  fetchAndSetUser,
} from "../lib/auth.js";

const ROLES = [
  { id: "buyer", icon: "🛒", title: "Buyer", desc: "Individuals and ESG buyers offsetting their footprint." },
  { id: "seller", icon: "🌱", title: "Seller", desc: "FPOs, project developers, and CBG plant operators." },
  { id: "business", icon: "🏢", title: "Business", desc: "Companies needing bulk credits, GST invoices, ESG reports." },
];

export default function Login({ setPage, setUser, mode = "login" }) {
  if (mode === "register") return <Register setPage={setPage} setUser={setUser} />;
  return <SignIn setPage={setPage} setUser={setUser} />;
}

// =============================================================================
// SIGN IN
// =============================================================================
function SignIn({ setPage, setUser }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user: authUser } = await signInWithEmail(form.email, form.password);
      await fetchAndSetUser(authUser.id, setUser, authUser);
      setPage("dashboard");
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(authErrorMessage(err));
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to manage your wallet and retirements.">
      {!isSupabaseConfigured && <ConfigWarning />}

      <GoogleButton onClick={handleGoogle} loading={googleLoading} disabled={loading} />

      <Divider />

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@company.com" required autoComplete="email" />
        <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="••••••••" required autoComplete="current-password" />

        {error && <ErrorBox>{error}</ErrorBox>}

        <Btn type="submit" disabled={loading} style={{ width: "100%", marginTop: 4 }}>
          {loading ? "Logging in…" : "Log in"}
        </Btn>
      </form>

      <SwitchLink>
        New to Carbon Bridge?{" "}
        <LinkButton onClick={() => setPage("register")}>Create account</LinkButton>
      </SwitchLink>
    </AuthShell>
  );
}

// =============================================================================
// REGISTER — 5-step flow
// =============================================================================
function Register({ setPage, setUser }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    role: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    company: "",
  });
  const [verifiedUser, setVerifiedUser] = useState(null); // auth user once verified

  // Resume the register flow if user clicks the email verification link and
  // lands back on /#register — we'll already have a session.
  useEffect(() => {
    let mounted = true;
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted || !session?.user) return;
      if (session.user.email_confirmed_at) {
        setVerifiedUser(session.user);
        setStep((s) => (s < 4 ? 4 : s));
      }
    });
    return () => { mounted = false; };
  }, []);

  const goNext = () => setStep((s) => Math.min(5, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  return (
    <AuthShell title="Create your account" subtitle="Start trading verified environmental credits in under 5 minutes." wide>
      {!isSupabaseConfigured && <ConfigWarning />}

      <Stepper step={step} />

      {step === 1 && <RoleStep data={data} setData={setData} onNext={goNext} />}
      {step === 2 && <DetailsStep data={data} setData={setData} onNext={(authUser) => { if (authUser) setVerifiedUser(authUser); goNext(); }} onBack={goBack} />}
      {step === 3 && <VerifyStep email={data.email} onVerified={(authUser) => { setVerifiedUser(authUser); goNext(); }} />}
      {step === 4 && <KycStep userId={verifiedUser?.id} onDone={goNext} onSkip={goNext} />}
      {step === 5 && <DoneStep setPage={setPage} setUser={setUser} verifiedUser={verifiedUser} />}

      <SwitchLink>
        Already have an account?{" "}
        <LinkButton onClick={() => setPage("login")}>Log in</LinkButton>
      </SwitchLink>
    </AuthShell>
  );
}

// -------------------- Step 1: Account Type ---------------------
function RoleStep({ data, setData, onNext }) {
  return (
    <div>
      <h3 style={stepTitle}>What kind of account?</h3>
      <p style={stepSubtitle}>Pick one — you can change this later from your dashboard.</p>

      <div style={{ display: "grid", gap: 12, marginBottom: 22 }}>
        {ROLES.map((r) => {
          const active = data.role === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setData({ ...data, role: r.id })}
              style={{
                background: active ? "rgba(34,197,94,0.1)" : T.bg1,
                border: `1.5px solid ${active ? "#22c55e" : T.border}`,
                color: T.text1,
                padding: "16px 18px",
                borderRadius: 14,
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontFamily: "inherit",
                transition: "all .2s",
              }}
            >
              <div style={{ fontSize: 28, flexShrink: 0 }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.5 }}>{r.desc}</div>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: 999, border: `2px solid ${active ? "#22c55e" : T.border}`, background: active ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {active && <span style={{ color: "#04131a", fontSize: 11, fontWeight: 900 }}>✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      <Btn onClick={onNext} disabled={!data.role} style={{ width: "100%" }}>
        Continue →
      </Btn>
    </div>
  );
}

// -------------------- Step 2: Details ---------------------
function DetailsStep({ data, setData, onNext, onBack }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (data.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await signUpWithEmail({
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        role: data.role,
        company: data.company,
      });
      // Supabase returns the user even before email verification.
      // If "Confirm email" is OFF in dashboard, the user may already be confirmed.
      const authUser = result.user;
      onNext(authUser?.email_confirmed_at ? authUser : null);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isBusiness = data.role === "business";

  return (
    <form onSubmit={submit}>
      <h3 style={stepTitle}>Your details</h3>
      <p style={stepSubtitle}>We'll send a verification link to your email.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 }}>
        <Field label="Full name" type="text" value={data.name} onChange={(v) => setData({ ...data, name: v })} placeholder="Harsh Bhavrayat" required autoComplete="name" />
        <Field label="Email" type="email" value={data.email} onChange={(v) => setData({ ...data, email: v })} placeholder="you@company.com" required autoComplete="email" />
        <Field label="Phone" type="tel" value={data.phone} onChange={(v) => setData({ ...data, phone: v })} placeholder="+91 90248 49162" required autoComplete="tel" />
        {isBusiness && (
          <Field label="Company name" type="text" value={data.company} onChange={(v) => setData({ ...data, company: v })} placeholder="Acme Industries Pvt. Ltd." required autoComplete="organization" />
        )}
        <Field label="Password" type="password" value={data.password} onChange={(v) => setData({ ...data, password: v })} placeholder="At least 8 characters" required autoComplete="new-password" />
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <Btn type="button" variant="outline" onClick={onBack} disabled={loading}>← Back</Btn>
        <Btn type="submit" disabled={loading} style={{ flex: 1 }}>
          {loading ? "Creating account…" : "Create account →"}
        </Btn>
      </div>
    </form>
  );
}

// -------------------- Step 3: Verify Email ---------------------
function VerifyStep({ email, onVerified }) {
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resending, setResending] = useState(false);
  const pollRef = useRef(null);

  // Poll session every 3 seconds; auto-advance when email is confirmed.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email_confirmed_at) {
        clearInterval(pollRef.current);
        onVerified(session.user);
      }
    };
    pollRef.current = setInterval(check, 3000);
    check();
    return () => clearInterval(pollRef.current);
  }, [onVerified]);

  const resend = async () => {
    setResendError("");
    setResending(true);
    try {
      await resendVerificationEmail(email);
      setResent(true);
    } catch (err) {
      setResendError(authErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
      <div style={{ fontSize: 56, marginBottom: 14 }}>📩</div>
      <h3 style={{ ...stepTitle, textAlign: "center" }}>Check your inbox</h3>
      <p style={{ ...stepSubtitle, textAlign: "center", maxWidth: 380, margin: "0 auto 22px" }}>
        We sent a verification link to <strong style={{ color: T.text1 }}>{email}</strong>.<br />
        Click the link to continue — this page will advance automatically.
      </p>

      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 18px", background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 12, fontSize: 13, color: T.text2, marginBottom: 22 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: "#22c55e", animation: "cb-pulse 1.4s ease-in-out infinite" }} />
        Waiting for verification…
      </div>

      <style>{`@keyframes cb-pulse { 0%,100% { opacity: 1; } 50% { opacity: .25; } }`}</style>

      {resendError && <ErrorBox>{resendError}</ErrorBox>}

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
        <Btn variant="outline" size="sm" onClick={resend} disabled={resending || resent}>
          {resending ? "Sending…" : resent ? "Email sent ✓" : "Resend email"}
        </Btn>
      </div>

      <p style={{ fontSize: 11, color: T.text3, marginTop: 22, lineHeight: 1.6 }}>
        Didn't receive it? Check your spam folder. The link is valid for 24 hours.
      </p>
    </div>
  );
}

// -------------------- Step 4: KYC ---------------------
function KycStep({ userId, onDone, onSkip }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      setError("Please pick a file first.");
      return;
    }
    if (!userId) {
      setError("Session expired — please refresh and log in again.");
      return;
    }
    setError("");
    setUploading(true);
    setProgress(0);
    try {
      await uploadKycDocument(userId, file, setProgress);
      setUploaded(true);
      setTimeout(onDone, 600);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h3 style={stepTitle}>Upload your KYC document</h3>
      <p style={stepSubtitle}>
        Upload one of: PAN card, Aadhaar, passport, or business registration certificate. PDF / JPG / PNG, max 10 MB.
      </p>

      <label
        htmlFor="kyc-file"
        style={{
          display: "block",
          background: T.bg1,
          border: `2px dashed ${file ? "#22c55e" : T.border}`,
          borderRadius: 14,
          padding: "28px 18px",
          textAlign: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          marginBottom: 14,
          transition: "border-color .2s",
        }}
      >
        <div style={{ fontSize: 34, marginBottom: 10 }}>{file ? "📄" : "⬆️"}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text1, marginBottom: 4 }}>
          {file ? file.name : "Click or drop a file here"}
        </div>
        <div style={{ fontSize: 12, color: T.text3 }}>
          {file ? `${(file.size / 1024).toFixed(0)} KB` : "PDF, JPG, or PNG up to 10 MB"}
        </div>
        <input
          id="kyc-file"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(e) => { setFile(e.target.files?.[0] ?? null); setError(""); }}
          disabled={uploading}
          style={{ display: "none" }}
        />
      </label>

      {(uploading || uploaded) && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ height: 8, background: T.bg1, borderRadius: 999, overflow: "hidden", border: `1px solid ${T.border}` }}>
            <div style={{ height: "100%", width: `${Math.round(progress * 100)}%`, background: "linear-gradient(90deg,#22c55e,#86efac)", transition: "width .25s ease" }} />
          </div>
          <div style={{ fontSize: 11, color: T.text3, marginTop: 6 }}>
            {uploaded ? "Uploaded ✓ — moving on…" : `Uploading… ${Math.round(progress * 100)}%`}
          </div>
        </div>
      )}

      {error && <ErrorBox>{error}</ErrorBox>}

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <Btn variant="outline" onClick={onSkip} disabled={uploading}>Skip — I'll do it later</Btn>
        <Btn onClick={handleUpload} disabled={uploading || uploaded || !file} style={{ flex: 1 }}>
          {uploading ? "Uploading…" : uploaded ? "Uploaded ✓" : "Upload & Continue →"}
        </Btn>
      </div>
    </div>
  );
}

// -------------------- Step 5: Done ---------------------
function DoneStep({ setPage, setUser, verifiedUser }) {
  const goDashboard = async () => {
    if (verifiedUser?.id) {
      try {
        await fetchAndSetUser(verifiedUser.id, setUser, verifiedUser);
      } catch {
        // ignore — App.jsx onAuthStateChange will catch it
      }
    }
    setPage("dashboard");
  };

  return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <h3 style={{ ...stepTitle, textAlign: "center" }}>You're in!</h3>
      <p style={{ ...stepSubtitle, textAlign: "center", maxWidth: 360, margin: "0 auto 24px" }}>
        Welcome to Carbon Bridge. Your account is ready — KYC review usually takes 1 business day.
      </p>
      <Btn onClick={goDashboard} style={{ width: "100%" }}>
        Go to dashboard →
      </Btn>
    </div>
  );
}

// =============================================================================
// SHARED PRIMITIVES
// =============================================================================

function AuthShell({ title, subtitle, children, wide }) {
  return (
    <div className="fade" style={{ minHeight: "75vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
      <div style={{ width: "100%", maxWidth: wide ? 480 : 420, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 22, padding: 32 }}>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 26, fontWeight: 900, marginBottom: 6, textAlign: "center" }}>{title}</h1>
        <p style={{ color: T.text2, fontSize: 14, marginBottom: 24, textAlign: "center" }}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

function Stepper({ step }) {
  const steps = ["Account", "Details", "Verify", "KYC", "Done"];
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, gap: 4 }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: 1, gap: 4 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 999,
              background: done ? "#22c55e" : active ? "rgba(34,197,94,0.15)" : T.bg1,
              border: `1.5px solid ${done || active ? "#22c55e" : T.border}`,
              color: done ? "#04131a" : active ? "#86efac" : T.text3,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, flexShrink: 0,
              transition: "all .2s",
            }}>
              {done ? "✓" : n}
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? "#22c55e" : T.border, borderRadius: 999 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function GoogleButton({ onClick, loading, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        width: "100%",
        background: "#fff",
        color: "#1f1f1f",
        border: "none",
        borderRadius: 12,
        padding: "12px 18px",
        fontSize: 14,
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: loading || disabled ? "not-allowed" : "pointer",
        opacity: loading || disabled ? 0.7 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        transition: "transform .15s",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.51 8.18c0-.55-.05-1.08-.14-1.59H9v3.01h4.21c-.18.97-.74 1.79-1.57 2.34v1.95h2.54c1.49-1.37 2.33-3.39 2.33-5.71z" fill="#4285F4" />
        <path d="M9 17c2.13 0 3.91-.71 5.21-1.92l-2.54-1.95c-.71.48-1.61.76-2.67.76-2.05 0-3.79-1.39-4.41-3.25H1.97v2.04A8 8 0 0 0 9 17z" fill="#34A853" />
        <path d="M4.59 10.64A4.79 4.79 0 0 1 4.34 9c0-.57.1-1.13.25-1.64V5.32H1.97A8 8 0 0 0 1 9c0 1.3.31 2.51.97 3.68l2.62-2.04z" fill="#FBBC05" />
        <path d="M9 4.75c1.16 0 2.2.4 3.02 1.18l2.25-2.25C13.05 2.18 11.27 1 9 1A8 8 0 0 0 1.97 5.32l2.62 2.04C5.21 6.14 6.95 4.75 9 4.75z" fill="#EA4335" />
      </svg>
      {loading ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0", color: T.text3, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
      <div style={{ flex: 1, height: 1, background: T.border }} />
      OR
      <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  );
}

function ErrorBox({ children }) {
  return (
    <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5", borderRadius: 12, padding: 12, fontSize: 13, marginTop: 6 }}>
      {children}
    </div>
  );
}

function ConfigWarning() {
  return (
    <div style={{ background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.35)", color: "#fdba74", borderRadius: 12, padding: 12, fontSize: 12, marginBottom: 16, lineHeight: 1.55 }}>
      ⚠️ Supabase isn't configured yet. Set <code style={codeChip}>VITE_SUPABASE_URL</code> and{" "}
      <code style={codeChip}>VITE_SUPABASE_ANON_KEY</code> in your <code style={codeChip}>.env.local</code> (dev) or
      Render → Environment (production), then redeploy.
    </div>
  );
}

const codeChip = { background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 5, fontSize: 11, fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace" };

function SwitchLink({ children }) {
  return (
    <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: T.text2 }}>{children}</div>
  );
}

function LinkButton({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", color: "#86efac", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: 0 }}>
      {children}
    </button>
  );
}

function Field({ label, type, value, onChange, placeholder, required, autoComplete }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, color: T.text3, fontWeight: 600, letterSpacing: 0.3 }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
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

const stepTitle = { fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 6, color: T.text1 };
const stepSubtitle = { fontSize: 13, color: T.text2, marginBottom: 20, lineHeight: 1.6 };
