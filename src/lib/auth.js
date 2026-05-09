import { supabase, isSupabaseConfigured } from "./supabase.js";

const NOT_CONFIGURED = new Error(
  "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment."
);

function ensureConfigured() {
  if (!isSupabaseConfigured) throw NOT_CONFIGURED;
}

/**
 * Build a unified user object from a Supabase auth user + their profile row.
 * Falls back gracefully to auth user_metadata when no profile row exists yet
 * (e.g. signup is mid-flow before the trigger has run).
 */
export function buildUserFromProfile(authUser, profile) {
  return {
    id: authUser.id,
    email: authUser.email || profile?.email || "",
    phone: profile?.phone ?? authUser.phone ?? authUser.user_metadata?.phone ?? "",
    phoneConfirmed: !!authUser.phone_confirmed_at,
    emailConfirmed: !!authUser.email_confirmed_at,
    name: profile?.name ?? authUser.user_metadata?.name ?? "",
    role: profile?.role ?? authUser.user_metadata?.role ?? "buyer",
    company: profile?.company ?? authUser.user_metadata?.company ?? "",
    country: profile?.country ?? "IN",
    language: profile?.language ?? authUser.user_metadata?.language ?? "en",
    kyc_status: profile?.kyc_status ?? "pending",
    kyc_doc_url: profile?.kyc_doc_url ?? null,
    wallet_balance: Number(profile?.wallet_balance ?? 0),
    created_at: profile?.created_at ?? authUser.created_at,
    profileExists: !!profile,
  };
}

/**
 * Fetch the auth user + profile row, build a unified user object, and pass it
 * into setUser. Used both on app boot (getSession) and on every onAuthStateChange.
 */
export async function fetchAndSetUser(userId, setUser, fallbackAuthUser = null) {
  ensureConfigured();

  let authUser = fallbackAuthUser;
  if (!authUser) {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      setUser(null);
      return null;
    }
    authUser = data.user;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.warn("[Carbon Bridge] Could not load profile, falling back to auth metadata:", profileError.message);
  }

  const user = buildUserFromProfile(authUser, profile);
  setUser(user);
  return user;
}

export async function signInWithEmail(email, password) {
  ensureConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle(redirectTo) {
  ensureConfigured();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo ?? (typeof window !== "undefined" ? window.location.origin + "/#dashboard" : undefined),
    },
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail({ email, password, name, phone, role, company, language }) {
  ensureConfigured();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone, role, company: company || null, language: language || "en" },
      emailRedirectTo: typeof window !== "undefined" ? window.location.origin + "/#register" : undefined,
    },
  });
  if (error) throw error;
  return data;
}

/** Normalize a free-form phone string to E.164 with India default (+91). */
export function toE164India(raw) {
  if (!raw) return "";
  const digits = String(raw).replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return "+" + digits;
  if (digits.length === 10) return "+91" + digits;
  if (digits.length === 11 && digits.startsWith("0")) return "+91" + digits.slice(1);
  if (raw.startsWith("+")) return "+" + digits;
  return "+91" + digits;
}

export function isValidIndianMobile(raw) {
  const digits = String(raw || "").replace(/\D/g, "").replace(/^91/, "").replace(/^0/, "");
  return /^[6-9]\d{9}$/.test(digits);
}

export async function sendPhoneOtp(phoneE164) {
  ensureConfigured();
  const { error } = await supabase.auth.signInWithOtp({
    phone: phoneE164,
    options: { channel: "sms" },
  });
  if (error) throw error;
}

export async function verifyPhoneOtp(phoneE164, token) {
  ensureConfigured();
  const { data, error } = await supabase.auth.verifyOtp({
    phone: phoneE164,
    token,
    type: "sms",
  });
  if (error) throw error;
  return data;
}

export async function resendVerificationEmail(email) {
  ensureConfigured();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) throw error;
}

export async function signOut(setUser) {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut();
  }
  setUser(null);
}

/**
 * Upload a KYC document to the 'kyc-documents' bucket and update the user's
 * profile row to reference it. onProgress receives a 0..1 fraction.
 */
export async function uploadKycDocument(userId, file, onProgress) {
  ensureConfigured();
  if (!file) throw new Error("No file selected");
  if (file.size > 10 * 1024 * 1024) throw new Error("File too large (max 10 MB)");

  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const filename = `${userId}/${Date.now()}.${ext}`;

  // The supabase-js v2 client doesn't expose XHR upload progress directly;
  // we simulate progress so the UI doesn't sit at 0 during a slow upload.
  let simulated = 0;
  const tick = setInterval(() => {
    simulated = Math.min(0.9, simulated + 0.05);
    onProgress?.(simulated);
  }, 200);

  try {
    const { error: uploadError } = await supabase.storage
      .from("kyc-documents")
      .upload(filename, file, { cacheControl: "3600", upsert: false, contentType: file.type });

    if (uploadError) throw uploadError;

    const { data: signed } = await supabase.storage
      .from("kyc-documents")
      .createSignedUrl(filename, 60 * 60 * 24 * 365); // 1 year

    const docUrl = signed?.signedUrl ?? filename;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ kyc_status: "pending", kyc_doc_url: docUrl })
      .eq("id", userId);

    if (updateError) throw updateError;

    onProgress?.(1);
    return { path: filename, url: docUrl };
  } finally {
    clearInterval(tick);
  }
}

/** Friendly error message extractor for Supabase auth errors. */
export function authErrorMessage(err) {
  if (!err) return "";
  const msg = err.message || String(err);
  if (/invalid login credentials/i.test(msg)) return "Wrong email or password.";
  if (/email not confirmed/i.test(msg)) return "Please verify your email first — check your inbox.";
  if (/user already registered/i.test(msg)) return "An account with that email already exists. Try logging in instead.";
  if (/weak.password|password.*at least/i.test(msg)) return "Password is too weak — use at least 8 characters.";
  if (/rate limit/i.test(msg)) return "Too many attempts. Wait a minute and try again.";
  if (/sms.*provider|phone.*provider|signup.*disabled.*phone|unsupported phone provider/i.test(msg))
    return "SMS login isn't enabled yet. Set up an SMS provider in Supabase → Authentication → Providers → Phone.";
  if (/invalid.*phone|phone.*invalid|phone.*format/i.test(msg)) return "Please enter a valid 10-digit Indian mobile number.";
  if (/invalid.*token|otp.*invalid|invalid.*otp/i.test(msg)) return "That OTP is incorrect or expired. Try again or request a new code.";
  return msg;
}
