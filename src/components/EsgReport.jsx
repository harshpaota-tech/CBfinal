import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const s = StyleSheet.create({
  page: { backgroundColor: "#ffffff", padding: 44, fontFamily: "Helvetica" },

  hero: { borderBottomWidth: 3, borderBottomColor: "#22c55e", borderBottomStyle: "solid", paddingBottom: 14, marginBottom: 22, display: "flex", flexDirection: "row", alignItems: "center", gap: 14 },
  heroLogo: { width: 48, height: 48 },
  heroTextWrap: { flex: 1 },
  heroBrand: { fontSize: 18, color: "#0e3d1c", fontFamily: "Helvetica-Bold", letterSpacing: 1.5 },
  heroTitle: { fontSize: 11, color: "#5d7290", marginTop: 2, letterSpacing: 1 },

  metaRow: { display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: 22, fontSize: 10, color: "#5d7290" },
  metaCell: { display: "flex", flexDirection: "column", gap: 2 },
  metaLabel: { fontSize: 8, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1 },
  metaValue: { fontSize: 11, color: "#0e3d1c", fontFamily: "Helvetica-Bold" },

  sectionTitle: { fontSize: 13, color: "#0e3d1c", fontFamily: "Helvetica-Bold", marginBottom: 10, letterSpacing: 0.5, textTransform: "uppercase" },

  bigStatRow: { display: "flex", flexDirection: "row", gap: 10, marginBottom: 24 },
  bigStat: { flex: 1, padding: 14, backgroundColor: "#f0fdf4", borderRadius: 8, borderWidth: 1, borderColor: "#bbf7d0", borderStyle: "solid" },
  bigStatLabel: { fontSize: 8, color: "#16a34a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, fontFamily: "Helvetica-Bold" },
  bigStatValue: { fontSize: 22, color: "#0e3d1c", fontFamily: "Helvetica-Bold" },
  bigStatSub: { fontSize: 9, color: "#5d7290", marginTop: 2 },

  table: { borderWidth: 1, borderColor: "#e2e8f0", borderStyle: "solid", borderRadius: 6, overflow: "hidden", marginBottom: 22 },
  tableHead: { display: "flex", flexDirection: "row", backgroundColor: "#f1f5f9", padding: "8 10", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", borderBottomStyle: "solid" },
  tableHeadCell: { fontSize: 8, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "Helvetica-Bold" },
  tableRow: { display: "flex", flexDirection: "row", padding: "8 10", borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0", borderBottomStyle: "solid" },
  tableCell: { fontSize: 10, color: "#1f2937" },

  c1: { width: "44%" },
  c2: { width: "20%", textAlign: "right" },
  c3: { width: "18%", textAlign: "right" },
  c4: { width: "18%", textAlign: "right" },

  equiv: { backgroundColor: "#f0fdf4", borderRadius: 8, padding: 14, marginBottom: 22, borderLeftWidth: 4, borderLeftColor: "#22c55e", borderLeftStyle: "solid" },
  equivTitle: { fontSize: 10, color: "#16a34a", fontFamily: "Helvetica-Bold", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 },
  equivLine: { fontSize: 11, color: "#0e3d1c", marginBottom: 3 },

  footer: { position: "absolute", bottom: 30, left: 44, right: 44, borderTopWidth: 1, borderTopColor: "#e2e8f0", borderTopStyle: "solid", paddingTop: 10, fontSize: 8, color: "#94a3b8", display: "flex", flexDirection: "row", justifyContent: "space-between" },
});

const today = () => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default function EsgReport({ user, items, logoUrl }) {
  const totalCredits = items.reduce((s, i) => s + (i.qty || 0), 0);
  const totalRetired = items.filter((i) => i.retired).reduce((s, i) => s + (i.qty || 0), 0);
  const totalSpent = items.reduce((s, i) => s + (i.paidINR || 0), 0);
  const kmAvoided = totalCredits * 222;
  const trees = totalCredits * 0.12;

  // Group by registry
  const byRegistry = {};
  items.forEach((i) => {
    const r = i.registry || "Other";
    if (!byRegistry[r]) byRegistry[r] = { qty: 0, value: 0, count: 0 };
    byRegistry[r].qty += i.qty || 0;
    byRegistry[r].value += i.paidINR || 0;
    byRegistry[r].count += 1;
  });
  const registryRows = Object.entries(byRegistry).sort((a, b) => b[1].qty - a[1].qty);

  return (
    <Document
      title={`ESG Report — ${user?.name || user?.email || "User"}`}
      author="Carbon Bridge Pvt. Ltd."
      subject="Verified carbon credit ESG summary report"
      creator="Carbon Bridge"
    >
      <Page size="A4" style={s.page}>
        <View style={s.hero}>
          {logoUrl && <Image src={logoUrl} style={s.heroLogo} />}
          <View style={s.heroTextWrap}>
            <Text style={s.heroBrand}>CARBON BRIDGE</Text>
            <Text style={s.heroTitle}>ESG Carbon Offset Report · {today()}</Text>
          </View>
        </View>

        <View style={s.metaRow}>
          <View style={s.metaCell}>
            <Text style={s.metaLabel}>Cardholder</Text>
            <Text style={s.metaValue}>{user?.name || user?.email || "—"}</Text>
          </View>
          {user?.company && (
            <View style={s.metaCell}>
              <Text style={s.metaLabel}>Organisation</Text>
              <Text style={s.metaValue}>{user.company}</Text>
            </View>
          )}
          <View style={s.metaCell}>
            <Text style={s.metaLabel}>Reporting period</Text>
            <Text style={s.metaValue}>Lifetime to {today()}</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Portfolio summary</Text>
        <View style={s.bigStatRow}>
          <View style={s.bigStat}>
            <Text style={s.bigStatLabel}>Credits owned</Text>
            <Text style={s.bigStatValue}>{totalCredits.toLocaleString("en-IN")}</Text>
            <Text style={s.bigStatSub}>tCO₂e</Text>
          </View>
          <View style={s.bigStat}>
            <Text style={s.bigStatLabel}>Permanently retired</Text>
            <Text style={s.bigStatValue}>{totalRetired.toLocaleString("en-IN")}</Text>
            <Text style={s.bigStatSub}>tCO₂e offset</Text>
          </View>
          <View style={s.bigStat}>
            <Text style={s.bigStatLabel}>Total invested</Text>
            <Text style={s.bigStatValue}>₹{totalSpent.toLocaleString("en-IN")}</Text>
            <Text style={s.bigStatSub}>{items.length} transaction{items.length === 1 ? "" : "s"}</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Breakdown by registry</Text>
        <View style={s.table}>
          <View style={s.tableHead}>
            <Text style={[s.tableHeadCell, s.c1]}>Registry</Text>
            <Text style={[s.tableHeadCell, s.c2]}>Projects</Text>
            <Text style={[s.tableHeadCell, s.c3]}>tCO₂e</Text>
            <Text style={[s.tableHeadCell, s.c4]}>Value (₹)</Text>
          </View>
          {registryRows.length === 0 ? (
            <View style={s.tableRow}>
              <Text style={[s.tableCell, { width: "100%", textAlign: "center", color: "#94a3b8" }]}>No transactions yet.</Text>
            </View>
          ) : (
            registryRows.map(([reg, agg]) => (
              <View key={reg} style={s.tableRow}>
                <Text style={[s.tableCell, s.c1]}>{reg}</Text>
                <Text style={[s.tableCell, s.c2]}>{agg.count}</Text>
                <Text style={[s.tableCell, s.c3]}>{agg.qty.toLocaleString("en-IN")}</Text>
                <Text style={[s.tableCell, s.c4]}>{agg.value.toLocaleString("en-IN")}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={s.sectionTitle}>Climate equivalence</Text>
        <View style={s.equiv}>
          <Text style={s.equivTitle}>Your {totalCredits.toLocaleString("en-IN")} tCO₂e is equivalent to</Text>
          <Text style={s.equivLine}>~{kmAvoided.toLocaleString("en-IN")} km of car driving avoided</Text>
          <Text style={s.equivLine}>~{trees.toLocaleString("en-IN", { maximumFractionDigits: 1 })} trees planted (annual sequestration)</Text>
        </View>

        <Text style={s.sectionTitle}>Disclosure note</Text>
        <Text style={{ fontSize: 9, color: "#475569", lineHeight: 1.6 }}>
          The credits listed above were purchased and (where marked) retired through the Carbon Bridge platform, India's
          first environmental credit marketplace. Each credit corresponds to one tonne of CO₂-equivalent emissions
          avoided, removed, or offset, and is registered on Verra (VCS), Verra W+, Gold Standard, ACR, or India's
          CPCB EPR registry as indicated. Retirements are recorded on the public registry and are not transferable.
          This report is suitable for inclusion in CSRD, GRI, SASB, BRSR, and similar ESG disclosures.
        </Text>

        <View style={s.footer} fixed>
          <Text>Carbon Bridge Pvt. Ltd. · Bhubaneswar, Odisha · thecarbonbridge.com</Text>
          <Text>Generated {today()}</Text>
        </View>
      </Page>
    </Document>
  );
}
