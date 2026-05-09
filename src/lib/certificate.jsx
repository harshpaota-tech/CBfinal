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

function getLogoUrl() {
  return typeof window !== "undefined" ? window.location.origin + "/logo.png" : undefined;
}

async function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  return url;
}

/** Generate single-cert PDF and download. */
export async function downloadCertificate(rawItem, user) {
  const item = toCertItem(rawItem);
  if (!item?.certId) throw new Error("Certificate is not ready yet — try again in a moment.");

  const [{ pdf }, { CarbonCertificate }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("../components/Certificate.jsx"),
  ]);

  const blob = await pdf(<CarbonCertificate item={item} user={user} logoUrl={getLogoUrl()} />).toBlob();
  await triggerDownload(blob, `CarbonBridge-Certificate-${item.certId}.pdf`);
  return { item };
}

/** Bundle every wallet item into ONE multi-page PDF and download. */
export async function downloadAllCertificates(rawItems, user) {
  const items = (rawItems || []).map(toCertItem).filter((i) => i?.certId);
  if (items.length === 0) throw new Error("Nothing to download — your wallet is empty.");

  const [{ pdf }, { CarbonCertificateBundle }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("../components/Certificate.jsx"),
  ]);

  const blob = await pdf(<CarbonCertificateBundle items={items} user={user} logoUrl={getLogoUrl()} />).toBlob();
  const stamp = new Date().toISOString().slice(0, 10);
  await triggerDownload(blob, `CarbonBridge-AllCertificates-${stamp}.pdf`);
  return { count: items.length };
}

/** Generate an ESG summary PDF (portfolio summary + registry breakdown +
 *  climate equivalence) and download. Designed to be droppable into a CSRD /
 *  GRI / SASB / BRSR report. */
export async function downloadEsgReport(rawItems, user) {
  const items = (rawItems || []).map(toCertItem);

  const [{ pdf }, { default: EsgReport }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("../components/EsgReport.jsx"),
  ]);

  const blob = await pdf(<EsgReport items={items} user={user} logoUrl={getLogoUrl()} />).toBlob();
  const stamp = new Date().toISOString().slice(0, 10);
  const who = (user?.name || user?.email || "user").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  await triggerDownload(blob, `CarbonBridge-ESG-Report-${who}-${stamp}.pdf`);
  return { count: items.length };
}
