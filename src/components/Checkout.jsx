import { useMemo, useState } from "react";
import { T } from "../theme.js";
import Btn from "./ui/Btn.jsx";
import Badge from "./ui/Badge.jsx";
import { CREDITS, formatINR, formatUSD, USD_TO_INR } from "../data/credits.js";
import { isRazorpayConfigured, openCheckout, generateCertId } from "../lib/razorpay.js";
import { insertTransaction } from "../lib/transactions.js";
import { showToast } from "../lib/toast.js";

const PLATFORM_FEE_PCT = 0.02;
const IS_DEV = import.meta.env.DEV;

export default function Checkout({ checkout, setCheckout, user, setPage, onPurchased }) {
  const credit = checkout?.credit;
  const [qty, setQty] = useState(checkout?.qty ?? 1);
  const [paying, setPaying] = useState(false);

  if (!credit) {
    return (
      <div className="fade" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: 380 }}>
          <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 26, fontWeight: 900, marginBottom: 10 }}>Nothing in checkout</h1>
          <p style={{ color: T.text2, fontSize: 14, marginBottom: 22 }}>Pick a project from the marketplace to start a purchase.</p>
          <Btn onClick={() => setPage("marketplace")}>Browse marketplace →</Btn>
        </div>
      </div>
    );
  }

  // Pricing math — single source of truth
  const priceINR = Math.round(credit.price * USD_TO_INR);
  const subtotalINR = priceINR * qty;
  const platformFeeINR = Math.round(subtotalINR * PLATFORM_FEE_PCT);
  const totalINR = subtotalINR + platformFeeINR;

  const remaining = credit.available;
  const exceeds = qty > remaining;

  const handlePay = async () => {
    if (!user) {
      showToast("Please log in or create an account first.", "error");
      setPage("login");
      return;
    }
    if (!isRazorpayConfigured) {
      showToast("Razorpay isn't set up yet — VITE_RAZORPAY_KEY_ID is missing.", "error", 6000);
      return;
    }
    if (exceeds) {
      showToast(`Only ${remaining.toLocaleString("en-IN")} credits available.`, "error");
      return;
    }

    try {
      await openCheckout({
        user,
        credit,
        qty,
        amountINR: totalINR,
        onSuccess: async (resp) => {
          await handlePaymentSuccess(resp);
        },
        onDismiss: (reason) => {
          showToast(reason || "Payment cancelled", "error");
        },
      });
    } catch (err) {
      showToast(err.message || "Could not open Razorpay.", "error", 6000);
    }
  };

  const handlePaymentSuccess = async ({ payment_id, order_id, signature }) => {
    setPaying(true);
    try {
      const certId = generateCertId();

      const row = {
        user_id: user.id,
        credit_id: credit.id,
        credit_name: credit.name,
        qty,
        price_inr: priceINR,
        total_inr: totalINR,
        payment_id,
        razorpay_order_id: order_id,
        cert_id: certId,
        status: "completed",
        registry: credit.registry,
        vintage: credit.vintage,
      };

      await insertTransaction(row);

      onPurchased?.({
        id: certId,
        creditName: credit.name,
        qty,
        paidINR: totalINR,
        paymentId: payment_id,
        certId,
        date: new Date().toISOString(),
        status: "active",
        registry: credit.registry,
        icon: credit.icon,
        signature,
      });

      showToast(`Payment successful! ${qty} tCO₂e credits added to your wallet 🌿`);
      setCheckout(null);
      setPage("dashboard");
    } catch (err) {
      showToast(err.message || "Could not save your purchase. Contact support with payment id " + payment_id, "error", 8000);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fade" style={{ maxWidth: 980, margin: "0 auto", padding: "60px 24px" }}>
      <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(28px,4vw,38px)", fontWeight: 900, marginBottom: 8 }}>Checkout</h1>
      <p style={{ color: T.text2, fontSize: 14, marginBottom: 30 }}>
        Confirm your order — payment is processed securely by Razorpay in INR.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 24, alignItems: "flex-start" }}>
        {/* LEFT: Product summary */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, padding: 26 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <Badge color={credit.color}>{credit.type}</Badge>
            <span style={{ fontSize: 12, color: T.text3 }}>{credit.flag} {credit.state}</span>
          </div>
          <div style={{ fontSize: 40, marginBottom: 12 }}>{credit.icon}</div>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 800, margin: 0, marginBottom: 10, lineHeight: 1.3 }}>{credit.name}</h2>
          <p style={{ color: T.text2, fontSize: 13, lineHeight: 1.65, marginBottom: 18 }}>{credit.desc}</p>

          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            <Chip>{credit.registry}</Chip>
            <Chip>Vintage {credit.vintage}</Chip>
            <Chip mono>{credit.certId}</Chip>
          </div>

          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Stat label="Available" value={remaining.toLocaleString("en-IN")} sub="tCO₂e" />
            <Stat label="Per tonne" value={formatINR(credit.price)} sub={`${formatUSD(credit.price)} USD`} />
          </div>
        </div>

        {/* RIGHT: Order panel */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 18, padding: 26, position: "sticky", top: 90 }}>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 700, margin: 0, marginBottom: 18 }}>Order summary</h3>

          <label style={{ display: "block", fontSize: 12, color: T.text3, fontWeight: 600, letterSpacing: 0.4, marginBottom: 8, textTransform: "uppercase" }}>Quantity (tCO₂e)</label>
          <div style={{ display: "flex", alignItems: "stretch", gap: 0, marginBottom: 6, border: `1px solid ${exceeds ? "rgba(239,68,68,0.5)" : T.border}`, borderRadius: 12, overflow: "hidden", background: T.bg1 }}>
            <StepperBtn onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}>−</StepperBtn>
            <input
              type="number"
              min={1}
              max={remaining}
              value={qty}
              onChange={(e) => {
                const n = Math.max(1, Math.min(remaining, parseInt(e.target.value || "1", 10) || 1));
                setQty(n);
              }}
              style={{ flex: 1, background: "transparent", border: "none", color: T.text1, fontSize: 18, fontWeight: 700, fontFamily: "inherit", textAlign: "center", padding: "12px 8px", outline: "none", appearance: "textfield", MozAppearance: "textfield" }}
            />
            <StepperBtn onClick={() => setQty((q) => Math.min(remaining, q + 1))} disabled={qty >= remaining}>+</StepperBtn>
          </div>
          {exceeds ? (
            <div style={{ fontSize: 11, color: "#fca5a5", marginBottom: 16 }}>Only {remaining.toLocaleString("en-IN")} credits available.</div>
          ) : (
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 16 }}>Max {remaining.toLocaleString("en-IN")} available.</div>
          )}

          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 8, fontSize: 13, color: T.text2, marginBottom: 14 }}>
            <Row label={`Subtotal (${qty} × ₹${priceINR.toLocaleString("en-IN")})`} value={`₹${subtotalINR.toLocaleString("en-IN")}`} />
            <Row label="Platform fee (2%)" value={`₹${platformFeeINR.toLocaleString("en-IN")}`} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "14px 0", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, marginBottom: 18 }}>
            <div style={{ fontSize: 13, color: T.text2, fontWeight: 600 }}>Total</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 28, fontWeight: 900, color: T.green, lineHeight: 1 }}>₹{totalINR.toLocaleString("en-IN")}</div>
              <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>incl. 2% platform fee</div>
            </div>
          </div>

          <Btn onClick={handlePay} disabled={paying || exceeds} style={{ width: "100%" }}>
            {paying ? "Saving…" : `Pay ₹${totalINR.toLocaleString("en-IN")} →`}
          </Btn>

          {!user && (
            <div style={{ marginTop: 12, fontSize: 12, color: T.text3, textAlign: "center" }}>
              You'll be asked to log in before payment.
            </div>
          )}

          {!isRazorpayConfigured && (
            <div style={{ marginTop: 12, fontSize: 11, color: "#fdba74", background: "rgba(251,146,60,0.08)", border: "1px solid rgba(251,146,60,0.35)", borderRadius: 10, padding: 10, lineHeight: 1.5 }}>
              ⚠️ Razorpay key not set. Add <code style={codeStyle}>VITE_RAZORPAY_KEY_ID</code> in <code style={codeStyle}>.env.local</code> (dev) or Render → Environment (prod), then redeploy.
            </div>
          )}

          {IS_DEV && (
            <div style={{ marginTop: 14, fontSize: 11, color: T.text3, background: T.bg1, border: `1px dashed ${T.border}`, borderRadius: 10, padding: 12, lineHeight: 1.6 }}>
              <div style={{ fontWeight: 700, color: T.text2, marginBottom: 6, letterSpacing: 0.4, textTransform: "uppercase", fontSize: 10 }}>Test mode</div>
              <div>Card: <code style={codeStyle}>4111 1111 1111 1111</code></div>
              <div>Expiry: any future date · CVV: any 3 digits</div>
              <div>OTP (if shown): <code style={codeStyle}>1234</code></div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <Btn variant="ghost" onClick={() => { setCheckout(null); setPage("marketplace"); }}>← Back to marketplace</Btn>
        <div style={{ fontSize: 12, color: T.text3, alignSelf: "center" }}>🔒 Secured by Razorpay · Payments in INR</div>
      </div>
    </div>
  );
}

function Chip({ children, mono }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: T.text2, padding: "3px 10px", borderRadius: 999, border: `1px solid ${T.border}`, fontFamily: mono ? "ui-monospace,SFMono-Regular,Menlo,monospace" : "inherit", letterSpacing: mono ? 0.3 : 0 }}>
      {children}
    </span>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: T.text3, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: T.text1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: T.text3, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
      <span>{label}</span>
      <span style={{ color: T.text1, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function StepperBtn({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "transparent",
        border: "none",
        color: disabled ? T.text3 : T.text1,
        fontSize: 22,
        fontWeight: 700,
        width: 44,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

const codeStyle = { background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 5, fontSize: 11, fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace" };
