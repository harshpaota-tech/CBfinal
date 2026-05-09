// =============================================================================
// Razorpay client-side checkout wrapper.
//
// Loads the Razorpay JS SDK (already script-tagged in index.html) and exposes
// helpers to open Checkout. This is a TEST-MODE flow:
//   - No backend order creation
//   - No HMAC signature verification
//   - The client-supplied notes are persisted as-is to Supabase
//
// PRODUCTION REQUIRES A BACKEND. Replace openCheckout() with a flow that:
//   1. POST /api/orders → backend calls Razorpay Orders API with secret key,
//      returns the razorpay_order_id
//   2. Pass that order_id into Razorpay options
//   3. On handler success, POST /api/verify with payment_id + order_id +
//      signature → backend verifies HMAC with secret, only then writes the
//      transaction
// =============================================================================

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

export const isRazorpayConfigured = Boolean(RAZORPAY_KEY && !RAZORPAY_KEY.includes("XXX"));

if (!isRazorpayConfigured && typeof window !== "undefined") {
  console.warn(
    "[Carbon Bridge] Razorpay env var missing.\n" +
      "Set VITE_RAZORPAY_KEY_ID in .env.local (dev) or Render → Environment (prod).\n" +
      "Use rzp_test_XXX while developing."
  );
}

/** Wait for the global Razorpay constructor to be available on window. */
export function waitForRazorpay(timeoutMs = 5000) {
  if (typeof window === "undefined") return Promise.reject(new Error("No window"));
  if (window.Razorpay) return Promise.resolve(window.Razorpay);

  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if (window.Razorpay) return resolve(window.Razorpay);
      if (Date.now() - start > timeoutMs) {
        return reject(
          new Error(
            "Razorpay SDK failed to load. Check your network and ad-blockers, then refresh."
          )
        );
      }
      setTimeout(tick, 80);
    };
    tick();
  });
}

/**
 * Open the Razorpay checkout modal.
 *
 * @param {object} args
 * @param {object} args.user      - { name, email, phone }
 * @param {object} args.credit    - { id, name, registry, certId, icon }
 * @param {number} args.qty       - tonnes
 * @param {number} args.amountINR - total in rupees (will be converted to paise)
 * @param {(payload: {payment_id:string, order_id:string, signature:string}) => void} args.onSuccess
 * @param {() => void} args.onDismiss
 */
export async function openCheckout({ user, credit, qty, amountINR, onSuccess, onDismiss }) {
  if (!isRazorpayConfigured) {
    throw new Error(
      "Razorpay key not configured. Add VITE_RAZORPAY_KEY_ID to your environment."
    );
  }

  const Razorpay = await waitForRazorpay();

  const options = {
    key: RAZORPAY_KEY,
    amount: Math.round(amountINR * 100), // paise
    currency: "INR",
    name: "Carbon Bridge Pvt. Ltd.",
    description: `${qty} tCO₂e — ${credit.name}`,
    image: typeof window !== "undefined" ? window.location.origin + "/logo.png" : undefined,
    handler: (response) => {
      onSuccess?.({
        payment_id: response.razorpay_payment_id,
        order_id: response.razorpay_order_id ?? null,
        signature: response.razorpay_signature ?? null,
      });
    },
    prefill: {
      name: user?.name || "",
      email: user?.email || "",
      contact: user?.phone || "",
    },
    notes: {
      credit_id: String(credit.id),
      credit_name: credit.name,
      qty: String(qty),
      registry: credit.registry,
      cert_id: credit.certId,
    },
    theme: { color: "#22c55e" },
    modal: {
      ondismiss: () => onDismiss?.(),
    },
  };

  const rzp = new Razorpay(options);

  // Surface explicit payment failures to the user via onDismiss with reason.
  rzp.on?.("payment.failed", (resp) => {
    const reason = resp?.error?.description || "Payment failed. Please try again.";
    onDismiss?.(reason);
  });

  rzp.open();
}

/** Generate a human-readable retirement-style certificate ID. */
export function generateCertId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CB-${ts}-${rnd}`;
}
