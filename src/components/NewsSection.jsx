import { T } from "../theme.js";
import { NEWS_PHOTOS, bgImage } from "../data/media.js";

const NEWS = [
  {
    photo: NEWS_PHOTOS[0],
    tag: "GREEN HYDROGEN",
    date: "16 May 2026",
    accent: "#5eead4",
    title: "Carbon Bridge launches India's first Green Hydrogen credit listing under NGHM",
    excerpt: "30 MW captive-solar electrolyzer in Gujarat, awarded under SECI's SIGHT Phase II tender. Issues 4,500 tCO₂e/yr of green-H2 credits at ₹2,088/t, aligned to BIS IS 18435:2023.",
  },
  {
    photo: NEWS_PHOTOS[1],
    tag: "POLICY",
    date: "12 May 2026",
    accent: "#5eead4",
    title: "SECI's SIGHT Phase II awards 4.5 lakh tonnes/year of green hydrogen across 10 producers",
    excerpt: "Production-linked incentive of ₹50/kg in year 1 declining to ₹40/kg by year 3. Carbon Bridge has signed letters of intent with 2 awardees in Gujarat and Andhra Pradesh.",
  },
  {
    photo: NEWS_PHOTOS[2],
    tag: "ANNOUNCEMENT",
    date: "8 May 2026",
    accent: "#86efac",
    title: "Carbon Bridge onboards 200 FPO farmers across Jharkhand for VM0047 agroforestry",
    excerpt: "Smallholder agroforestry aggregated into one Verra VCS Programme of Activity, cutting per-farmer registration cost by 90%. First credits issued Q4 2026.",
  },
  {
    photo: NEWS_PHOTOS[0],
    tag: "INSIGHT",
    date: "3 May 2026",
    accent: "#86efac",
    title: "Why India's National Green Hydrogen Mission could anchor a new credit class",
    excerpt: "₹19,744 cr outlay, 5 MMT/yr target by 2030, 50 MMT CO₂e/yr avoidance. With BIS IS 18435:2023 setting the integrity baseline, voluntary VCS layered credits are next.",
  },
  {
    photo: NEWS_PHOTOS[1],
    tag: "IMPACT",
    date: "28 April 2026",
    accent: "#86efac",
    title: "Five years in: the Sundarban blue carbon programme has restored 3,000 hectares",
    excerpt: "Mangrove restoration in West Bengal now protects 12 villages from cyclone-driven storm surge while sequestering 18,000 tCO₂e/year under Verra VM0033.",
  },
  {
    photo: NEWS_PHOTOS[2],
    tag: "REGULATORY",
    date: "22 April 2026",
    accent: "#86efac",
    title: "CPCB tightens EPR plastic recovery targets to 75% for FY 2026-27",
    excerpt: "Producers, importers, and brand-owners must meet higher annual targets via the CPCB EPR Portal. Carbon Bridge's Karnataka recyclers expand capacity by 40% to meet demand.",
  },
];

export default function NewsSection() {
  return (
    <section style={{ padding: "80px 24px", background: T.bg0 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 18 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#86efac", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Latest</div>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(28px,4vw,38px)", fontWeight: 900, margin: 0, lineHeight: 1.15 }}>
              Announcements & insights
            </h2>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 22 }}>
          {NEWS.map((item, i) => (
            <NewsCard key={i} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsCard({ item }) {
  const accent = item.accent || "#86efac";
  return (
    <article
      style={{
        background: T.bg2,
        border: `1px solid ${T.border}`,
        borderRadius: 18,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform .3s ease, border-color .2s, box-shadow .3s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = accent + "59";
        e.currentTarget.style.boxShadow = `0 12px 40px ${accent}26`;
        const img = e.currentTarget.querySelector("[data-news-img]");
        if (img) img.style.transform = "scale(1.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.boxShadow = "none";
        const img = e.currentTarget.querySelector("[data-news-img]");
        if (img) img.style.transform = "none";
      }}
    >
      <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
        <div data-news-img style={{ position: "absolute", inset: 0, transition: "transform .8s ease", ...bgImage(item.photo) }} />
        <div style={{ position: "absolute", top: 12, left: 12, background: `${accent}22`, color: accent, border: `1px solid ${accent}66`, borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", backdropFilter: "blur(6px)" }}>
          {item.tag}
        </div>
      </div>
      <div style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>
          <span>{item.date}</span>
        </div>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 18, lineHeight: 1.3, color: T.text1, margin: 0, marginBottom: 10 }}>{item.title}</h3>
        <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65, margin: 0 }}>{item.excerpt}</p>
        <div style={{ marginTop: 14, fontSize: 12, fontWeight: 700, color: accent, letterSpacing: 0.5 }}>READ MORE →</div>
      </div>
    </article>
  );
}
