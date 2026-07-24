import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { T } from "../theme.js";
import Btn from "./ui/Btn.jsx";
import OtpInput from "./ui/OtpInput.jsx";
import { supabase, isSupabaseConfigured } from "../lib/supabase.js";
import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  resendVerificationEmail,
  uploadKycDocument,
  authErrorMessage,
  fetchAndSetUser,
  sendPhoneOtp,
  verifyPhoneOtp,
  toE164India,
  isValidIndianMobile,
} from "../lib/auth.js";
import { setLanguage } from "../i18n/index.js";

const ROLES = [
  { id: "buyer", icon: "🛒", title: "Buyer", desc: "Individuals and ESG buyers offsetting their footprint." },
  { id: "seller", icon: "🌱", title: "Seller", desc: "FPOs, project developers, and CBG plant operators." },
  { id: "business", icon: "🏢", title: "Business", desc: "Companies needing bulk credits, GST invoices, ESG reports." },
];

const RESEND_COOLDOWN_SEC = 30;

export default function Login({ setPage, setUser, mode = "login" }) {
  if (mode === "register") return <Register setPage={setPage} setUser={setUser} />;
  return <SignIn setPage={setPage} setUser={setUser} />;
}

// =============================================================================
// SIGN IN — email/password OR phone OTP
// =============================================================================
function SignIn({ setPage, setUser }) {
  const { t } = useTranslation();
  const [method, setMethod] = useState("email"); // 'email' | 'phone'

  return (
    <AuthShell title={t("auth.welcomeBack")} subtitle={t("auth.signIn")}>
      {!isSupabaseConfigured && <ConfigWarning />}

      <MethodTabs method={method} onChange={setMethod} />

      {method === "email" ? (
        <EmailSignIn setPage={setPage} setUser={setUser} />
      ) : (
        <PhoneSignIn setPage={setPage} setUser={setUser} />
      )}

      <SwitchLink>
        {t("auth.dontHaveAccount")}{" "}
        <LinkButton onClick={() => setPage("register")}>{t("auth.signUpFree")}</LinkButton>
      </SwitchLink>
    </AuthShell>
  );
}

function MethodTabs({ method, onChange }) {
  const { t } = useTranslation();
  const tabs = [
    { id: "email", label: t("auth.loginWithEmail"), icon: "✉️" },
    { id: "phone", label: t("auth.loginWithPhone"), icon: "📱" },
  ];
  return (
    <div style={{ display: "flex", background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 12, padding: 4, marginBottom: 18 }}>
      {tabs.map((tab) => {
        const active = method === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              background: active ? "rgba(34,197,94,0.12)" : "transparent",
              border: `1px solid ${active ? "rgba(34,197,94,0.35)" : "transparent"}`,
              color: active ? "#86efac" : T.text2,
              padding: "9px 10px",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all .15s",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span aria-hidden style={{ fontSize: 14 }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function EmailSignIn({ setPage, setUser }) {
  const { t } = useTranslation();
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
    <>
      <GoogleButton onClick={handleGoogle} loading={googleLoading} disabled={loading} />
      <Divider />

      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label={t("auth.email")} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@company.com" required autoComplete="email" />
        <Field label={t("auth.password")} type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="••••••••" required autoComplete="current-password" />

        {error && <ErrorBox>{error}</ErrorBox>}

        <Btn type="submit" disabled={loading} style={{ width: "100%", marginTop: 4 }}>
          {loading ? "…" : t("auth.signIn")}
        </Btn>
      </form>
    </>
  );
}

// -------------------- Phone OTP flow ---------------------
function PhoneSignIn({ setPage, setUser }) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState("");
  const [stage, setStage] = useState("phone"); // 'phone' | 'otp'
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Countdown for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const e164 = toE164India(phone);

  const sendOtp = async () => {
    setError("");
    if (!isValidIndianMobile(phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    setSending(true);
    try {
      await sendPhoneOtp(e164);
      setStage("otp");
      setCooldown(RESEND_COOLDOWN_SEC);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const verify = async (token) => {
    const code = token || otp;
    if (code.length !== 6) return;
    setError("");
    setVerifying(true);
    try {
      const { user: authUser } = await verifyPhoneOtp(e164, code);
      if (!authUser) throw new Error("Verification failed — no user returned.");
      await fetchAndSetUser(authUser.id, setUser, authUser);
      setPage("dashboard");
    } catch (err) {
      setError(authErrorMessage(err));
      setVerifying(false);
    }
  };

  if (stage === "phone") {
    return (
      <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 12, color: T.text3, fontWeight: 600, letterSpacing: 0.3 }}>{t("auth.phoneNumber")}</span>
          <div style={{ display: "flex", alignItems: "stretch", background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
            <span style={{
              padding: "12px 14px",
              fontSize: 14,
              color: T.text2,
              background: T.bg2,
              borderRight: `1px solid ${T.border}`,
              fontWeight: 600,
              userSelect: "none",
            }}>🇮🇳 +91</span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder={t("auth.phonePlaceholder")}
              required
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: T.text1,
                fontSize: 16,
                padding: "12px 14px",
                outline: "none",
                fontFamily: "inherit",
                letterSpacing: 0.5,
              }}
            />
          </div>
        </label>

        {error && <ErrorBox>{error}</ErrorBox>}

        <Btn type="submit" disabled={sending || !isValidIndianMobile(phone)} style={{ width: "100%", marginTop: 4 }}>
          {sending ? "…" : t("auth.sendOtp")}
        </Btn>
      </form>
    );
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div style={{ fontSize: 13, color: T.text2, marginBottom: 4 }}>
          {t("auth.otpSentTo")}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text1, letterSpacing: 0.5 }}>{e164}</div>
        <button
          type="button"
          onClick={() => { setStage("phone"); setOtp(""); setError(""); }}
          style={{ background: "none", border: "none", color: "#86efac", fontWeight: 600, fontSize: 12, marginTop: 6, cursor: "pointer", fontFamily: "inherit" }}
        >
          {t("auth.changeNumber")}
        </button>
      </div>

      <div style={{ marginBottom: 14 }}>
        <OtpInput
          length={6}
          value={otp}
          onChange={(v) => { setOtp(v); setError(""); }}
          onComplete={(code) => verify(code)}
          disabled={verifying}
        />
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      <Btn onClick={() => verify()} disabled={verifying || otp.length !== 6} style={{ width: "100%", marginTop: 4 }}>
        {verifying ? "…" : t("auth.verifyOtp")}
      </Btn>

      <div style={{ textAlign: "center", marginTop: 14 }}>
        {cooldown > 0 ? (
          <span style={{ fontSize: 12, color: T.text3 }}>
            {t("auth.resendIn", { seconds: cooldown })}
          </span>
        ) : (
          <button
            type="button"
            onClick={sendOtp}
            disabled={sending}
            style={{ background: "none", border: "none", color: "#86efac", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
          >
            {sending ? "…" : t("auth.resendOtp")}
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// REGISTER — 5-step flow (with "I prefer Hindi" checkbox)
// =============================================================================
function Register({ setPage, setUser }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    role: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    company: "",
    language: "en",
  });
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [googleError, setGoogleError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogle = async () => {
    setGoogleError("");
    setGoogleLoading(true);
    try {
      // Google verifies the email itself, so the redirect back skips
      // straight past the password + email-OTP steps (see the
      // getSession effect above, which lands verified users on step 4).
      await signInWithGoogle(typeof window !== "undefined" ? window.location.origin + "/register" : undefined);
    } catch (err) {
      setGoogleError(authErrorMessage(err));
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell title={t("auth.createAccount")} subtitle={t("home.subhero")} wide>
      {!isSupabaseConfigured && <ConfigWarning />}

      {step === 1 && (
        <>
          <GoogleButton onClick={handleGoogle} loading={googleLoading} disabled={false} />
          {googleError && <ErrorBox>{googleError}</ErrorBox>}
          <Divider />
        </>
      )}

      <Stepper step={step} />

      {step === 1 && <RoleStep data={data} setData={setData} onNext={goNext} />}
      {step === 2 && <DetailsStep data={data} setData={setData} onNext={(authUser) => { if (authUser) setVerifiedUser(authUser); goNext(); }} onBack={goBack} />}
      {step === 3 && <VerifyStep email={data.email} onVerified={(authUser) => { setVerifiedUser(authUser); goNext(); }} />}
      {step === 4 && <KycStep userId={verifiedUser?.id} onDone={goNext} onSkip={goNext} />}
      {step === 5 && <DoneStep setPage={setPage} setUser={setUser} verifiedUser={verifiedUser} />}

      <SwitchLink>
        {t("auth.alreadyHaveAccount")}{" "}
        <LinkButton onClick={() => setPage("login")}>{t("auth.signIn")}</LinkButton>
      </SwitchLink>
    </AuthShell>
  );
}

function RoleStep({ data, setData, onNext }) {
  const { t } = useTranslation();
  return (
    <div>
      <h3 style={stepTitleStyle}>{t("auth.step1Title")}</h3>
      <p style={stepSubtitleStyle}>{t("auth.step1Subtitle")}</p>

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
        {t("auth.continueButton")}
      </Btn>
    </div>
  );
}

function DetailsStep({ data, setData, onNext, onBack }) {
  const { t, i18n } = useTranslation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const togglePreferHindi = (checked) => {
    const lang = checked ? "hi" : "en";
    setData({ ...data, language: lang });
    setLanguage(lang);
  };
  const preferHindi = data.language === "hi" || i18n.language?.startsWith("hi");

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
        language: data.language || (i18n.language?.startsWith("hi") ? "hi" : "en"),
      });
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
      <h3 style={stepTitleStyle}>{t("auth.step2Title")}</h3>
      <p style={stepSubtitleStyle}>{t("auth.step2Subtitle")}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
        <Field label={t("auth.fullName")} type="text" value={data.name} onChange={(v) => setData({ ...data, name: v })} placeholder="Harsh Bhavrayat" required autoComplete="name" />
        <Field label={t("auth.email")} type="email" value={data.email} onChange={(v) => setData({ ...data, email: v })} placeholder="you@company.com" required autoComplete="email" />
        <Field label={t("auth.phone")} type="tel" value={data.phone} onChange={(v) => setData({ ...data, phone: v })} placeholder="+91 90248 49162" required autoComplete="tel" />
        {isBusiness && (
          <Field label={t("auth.companyName")} type="text" value={data.company} onChange={(v) => setData({ ...data, company: v })} placeholder="Acme Industries Pvt. Ltd." required autoComplete="organization" />
        )}
        <Field label={t("auth.password")} type="password" value={data.password} onChange={(v) => setData({ ...data, password: v })} placeholder="At least 8 characters" required autoComplete="new-password" />
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: T.bg1, border: `1px solid ${preferHindi ? "rgba(34,197,94,0.4)" : T.border}`, borderRadius: 12, cursor: "pointer", marginBottom: 16, transition: "border-color .2s" }}>
        <input
          type="checkbox"
          checked={preferHindi}
          onChange={(e) => togglePreferHindi(e.target.checked)}
          style={{ accentColor: "#22c55e", width: 16, height: 16, cursor: "pointer" }}
        />
        <span style={{ fontSize: 13, color: T.text1, fontWeight: 500 }}>{t("auth.preferHindi")}</span>
      </label>

      {error && <ErrorBox>{error}</ErrorBox>}

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <Btn type="button" variant="outline" onClick={onBack} disabled={loading}>{t("auth.back")}</Btn>
        <Btn type="submit" disabled={loading} style={{ flex: 1 }}>
          {loading ? "…" : `${t("auth.createAccount")} →`}
        </Btn>
      </div>
    </form>
  );
}

function VerifyStep({ email, onVerified }) {
  const { t } = useTranslation();
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resending, setResending] = useState(false);
  const pollRef = useRef(null);

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
      <h3 style={{ ...stepTitleStyle, textAlign: "center" }}>{t("auth.step3Title")}</h3>
      <p style={{ ...stepSubtitleStyle, textAlign: "center", maxWidth: 380, margin: "0 auto 22px" }}>
        We sent a verification link to <strong style={{ color: T.text1 }}>{email}</strong>.
      </p>

      <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 18px", background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 12, fontSize: 13, color: T.text2, marginBottom: 22 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: "#22c55e", animation: "cb-pulse 1.4s ease-in-out infinite" }} />
        Waiting for verification…
      </div>

      <style>{`@keyframes cb-pulse { 0%,100% { opacity: 1; } 50% { opacity: .25; } }`}</style>

      {resendError && <ErrorBox>{resendError}</ErrorBox>}

      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
        <Btn variant="outline" size="sm" onClick={resend} disabled={resending || resent}>
          {resending ? "…" : resent ? "✓" : "Resend email"}
        </Btn>
      </div>
    </div>
  );
}

function KycStep({ userId, onDone, onSkip }) {
  const { t } = useTranslation();
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
      <h3 style={stepTitleStyle}>{t("auth.step4Title")}</h3>
      <p style={stepSubtitleStyle}>
        Upload one of: PAN card, Aadhaar, passport, or business registration certificate. PDF / JPG / PNG, max 10 MB.
      </p>

      <label htmlFor="kyc-file" style={{ display: "block", background: T.bg1, border: `2px dashed ${file ? "#22c55e" : T.border}`, borderRadius: 14, padding: "28px 18px", textAlign: "center", cursor: uploading ? "not-allowed" : "pointer", marginBottom: 14 }}>
        <div style={{ fontSize: 34, marginBottom: 10 }}>{file ? "📄" : "⬆️"}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: T.text1, marginBottom: 4 }}>
          {file ? file.name : "Click or drop a file here"}
        </div>
        <div style={{ fontSize: 12, color: T.text3 }}>
          {file ? `${(file.size / 1024).toFixed(0)} KB` : "PDF, JPG, or PNG up to 10 MB"}
        </div>
        <input id="kyc-file" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setError(""); }} disabled={uploading} style={{ display: "none" }} />
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

function DoneStep({ setPage, setUser, verifiedUser }) {
  const { t } = useTranslation();
  const goDashboard = async () => {
    if (verifiedUser?.id) {
      try { await fetchAndSetUser(verifiedUser.id, setUser, verifiedUser); } catch {}
    }
    setPage("dashboard");
  };

  return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
      <h3 style={{ ...stepTitleStyle, textAlign: "center" }}>{t("auth.step5Title")}</h3>
      <p style={{ ...stepSubtitleStyle, textAlign: "center", maxWidth: 360, margin: "0 auto 24px" }}>
        Welcome to Carbon Bridge. Your account is ready — KYC review usually takes 1 business day.
      </p>
      <Btn onClick={goDashboard} style={{ width: "100%" }}>
        {t("auth.goToDashboard")}
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
  const { t } = useTranslation();
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
      {loading ? "…" : t("auth.continueWithGoogle")}
    </button>
  );
}

function Divider() {
  const { t } = useTranslation();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0", color: T.text3, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
      <div style={{ flex: 1, height: 1, background: T.border }} />
      {t("auth.orContinueWith")}
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

const stepTitleStyle = { fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 6, color: "#e6f1ff" };
const stepSubtitleStyle = { fontSize: 13, color: "#9fb3c8", marginBottom: 20, lineHeight: 1.6 };
