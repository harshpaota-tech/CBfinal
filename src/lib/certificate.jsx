// =============================================================================
// Certificate download helpers
//
// Both @react-pdf/renderer (~700 KB) and src/components/Certificate.jsx are
// loaded with dynamic import() so they code-split into a separate chunk that
// only downloads the first time a user clicks "Download Certificate".
// Main bundle stays small.
// =============================================================================

/** Normalize Supabase row OR optimistic in-memory wallet item to the shape
 *  the certificate component expects. */
export function toCertItem(t) {
  if (!t) return null;
  return {
    certId: t.certId ?? t.cert_id ?? null,
    creditName: t.creditName ?? t.credit_name ?? "Carbon Bridge Project",
    qty: Number(t.qty ?? 0),
    paidINR: Number(t.paidINR ?? t.total_inr ?? 0),
    paymentId: t.paymentId ?? t.payment_id ?? null,
    registry: t.registry ?? "Verra VCS",
    vintage: t.vintage ?? null,
    icon: t.icon ?? t._icon ?? null,
    date: t.date ?? t.created_at ?? new Date().toISOString(),
    retired: Boolean(t.retired),
  };
}

/**
 * Generate the PDF and trigger a download in the browser. Loads react-pdf and
 * the Certificate component dynamically (code-split).
 */
export async function downloadCertificate(rawItem, user) {
  const item = toCertItem(rawItem);
  if (!item?.certId) {
    throw new Error("Certificate is not ready yet — try again in a moment.");
  }

  const [{ pdf }, { CarbonCertificate }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("../components/Certificate.jsx"),
  ]);

  const logoUrl = typeof window !== "undefined" ? window.location.origin + "/logo.png" : undefined;

  const blob = await pdf(<CarbonCertificate item={item} user={user} logoUrl={logoUrl} />).toBlob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `CarbonBridge-Certificate-${item.certId}.pdf`;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);

  return { item, url };
}
