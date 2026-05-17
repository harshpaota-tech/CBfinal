import { T } from "../theme.js";
import { NEWS_PHOTOS, bgImage } from "../data/media.js";

const NEWS = [
  {
    photo: NEWS_PHOTOS[0],
    tag: "ANNOUNCEMENT",
    date: "14 May 2026",
    title: "Carbon Bridge onboards 200 FPO farmers across Jharkhand",
    excerpt: "Our agroforestry programme aggregates smallholder plots into a single Verra VCS Programme of Activity, cutting registration cost by 90%.",
  },
  {
    photo: NEWS_PHOTOS[1],
    tag: "INSIGHT",
    date: "9 May 2026",
    title: "The evolution of carbon markets in India could define their global future",
    excerpt: "With SATAT-registered CBG plants, regenerative soil carbon, and India's CPCB EPR registry maturing in parallel, the next 24 months will reshape voluntary markets.",
  },
  {
    photo: NEWS_PHOTOS[2],
    tag: "IMPACT",
    date: "2 May 2026",
    title: "Five years in, the Sundarban blue carbon programme has restored 3,000 hectares",
    excerpt: "Mangrove restoration in West Bengal now protects 12 villages from cyclone-driven storm surge while sequestering 18,000 tCO₂e/year.",
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
        e.currentTarget.style.borderColor = "rgba(34,197,94,0.35)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(34,197,94,0.15)";
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
      </div>
      <div style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>
          <span style={{ color: "#86efac" }}>{item.tag}</span>
          <span>·</span>
          <span>{item.date}</span>
        </div>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 18, lineHeight: 1.3, color: T.text1, margin: 0, marginBottom: 10 }}>{item.title}</h3>
        <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65, margin: 0 }}>{item.excerpt}</p>
        <div style={{ marginTop: 14, fontSize: 12, fontWeight: 700, color: "#86efac", letterSpacing: 0.5 }}>READ MORE →</div>
      </div>
    </article>
  );
}
