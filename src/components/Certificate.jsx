// =============================================================================
// PDF Carbon Credit Retirement Certificate
//
// Built with @react-pdf/renderer. This component is intentionally NOT imported
// at the top of any other file — it is dynamically imported by
// src/lib/certificate.jsx so the heavy react-pdf SDK code-splits into its
// own chunk and only loads when the user clicks "Download Certificate".
// =============================================================================

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#04080f",
    padding: 50,
    fontFamily: "Helvetica",
  },
  border: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    borderWidth: 2,
    borderColor: "#22c55e",
    borderStyle: "solid",
    borderRadius: 12,
  },
  innerBorder: {
    position: "absolute",
    top: 28,
    left: 28,
    right: 28,
    bottom: 28,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.25)",
    borderStyle: "solid",
    borderRadius: 8,
  },
  watermark: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 90,
    color: "rgba(34,197,94,0.04)",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 6,
  },
  logoRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  logo: {
    width: 56,
    height: 56,
  },
  header: {
    textAlign: "center",
    marginBottom: 26,
  },
  title: {
    fontSize: 28,
    color: "#86efac",
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    letterSpacing: 3,
  },
  subtitle: {
    fontSize: 11,
    color: "#94a3b8",
    letterSpacing: 2,
  },
  certBody: {
    textAlign: "center",
    marginBottom: 26,
  },
  bodyText: {
    fontSize: 12,
    color: "#e2e8f0",
    lineHeight: 1.8,
    marginBottom: 6,
  },
  recipient: {
    fontSize: 22,
    color: "#86efac",
    fontFamily: "Helvetica-Bold",
    marginVertical: 8,
  },
  highlight: {
    fontSize: 36,
    color: "#34d399",
    fontFamily: "Helvetica-Bold",
    marginVertical: 12,
  },
  projectName: {
    fontSize: 15,
    color: "#e2e8f0",
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
  },
  detailsGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  detailBox: {
    width: "48%",
    backgroundColor: "#0d1525",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.2)",
    borderStyle: "solid",
  },
  detailLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  detailValue: {
    fontSize: 12,
    color: "#e2e8f0",
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    marginTop: 26,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(34,197,94,0.25)",
    borderTopStyle: "solid",
    paddingTop: 14,
  },
  footerText: {
    fontSize: 9,
    color: "#94a3b8",
    marginBottom: 5,
    lineHeight: 1.6,
  },
  serial: {
    fontSize: 10,
    color: "#86efac",
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    marginTop: 6,
  },
});

export const CarbonCertificate = ({ item, user, logoUrl }) => {
  const dateStr = (() => {
    try {
      return new Date(item.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  })();

  const details = [
    ["Certificate ID", item.certId || "—"],
    ["Registry", item.registry || "Verra VCS"],
    ["Retirement Date", dateStr],
    ["Tonnes Retired", `${item.qty} tCO₂e`],
    ["Payment Reference", item.paymentId || "N/A"],
    ["Verified By", "Carbon Bridge Pvt. Ltd."],
    ["Platform", "thecarbonbridge.com"],
    ["Status", "PERMANENTLY RETIRED"],
  ];

  return (
    <Document
      title={`Carbon Bridge Certificate ${item.certId || ""}`}
      author="Carbon Bridge Pvt. Ltd."
      subject={`Retirement of ${item.qty} tCO2e from ${item.creditName}`}
      creator="Carbon Bridge"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.border} fixed />
        <View style={styles.innerBorder} fixed />
        <Text style={styles.watermark} fixed>RETIRED</Text>

        {logoUrl && (
          <View style={styles.logoRow}>
            <Image src={logoUrl} style={styles.logo} />
          </View>
        )}

        <View style={styles.header}>
          <Text style={styles.title}>CARBON BRIDGE</Text>
          <Text style={styles.subtitle}>VERIFIED CARBON CREDIT RETIREMENT CERTIFICATE</Text>
        </View>

        <View style={styles.certBody}>
          <Text style={styles.bodyText}>This certifies that</Text>
          <Text style={styles.recipient}>{user?.name || user?.email || "Cardholder"}</Text>
          <Text style={styles.bodyText}>has permanently retired</Text>
          <Text style={styles.highlight}>{item.qty} tCO₂e</Text>
          <Text style={styles.bodyText}>of verified carbon credits from</Text>
          <Text style={styles.projectName}>{item.creditName}</Text>
        </View>

        <View style={styles.detailsGrid}>
          {details.map(([label, value]) => (
            <View key={label} style={styles.detailBox}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={styles.detailValue}>{String(value)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This retirement is permanent and cannot be reversed. The carbon credits
            have been removed from circulation on the {item.registry || "Verra"}
            registry and can no longer be used by any other party.
          </Text>
          <Text style={styles.footerText}>
            Carbon Bridge Pvt. Ltd. | Bhubaneswar, Odisha, India | CIN: Pending
          </Text>
          <Text style={styles.serial}>SERIAL: {item.certId || "—"}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default CarbonCertificate;
