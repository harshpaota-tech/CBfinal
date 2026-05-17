import { T } from "../theme.js";
import { PROGRAM_PHOTOS, bgImage } from "../data/media.js";

const PROGRAMS = [
  { id: "cbg",       title: "CBG & Biogas",       subtitle: "AMS-III.R · SATAT-registered", color: "#22c55e", photo: PROGRAM_PHOTOS.cbg,        cat: "CBG / Biogas" },
  { id: "forestry",  title: "Forestry & REDD+",    subtitle: "Verra VCS · VM0007 / VM0017",  color: "#10b981", photo: PROGRAM_PHOTOS.forestry,   cat: "Carbon / Forestry" },
  { id: "soil",      title: "Soil Carbon",         subtitle: "Verra VM0042 · GPS + satellite MRV", color: "#a78bfa", photo: PROGRAM_PHOTOS.soil,   cat: "Soil Carbon" },
  { id: "plastic",   title: "EPR & Ocean Plastic", subtitle: "CPCB EPR · Verra W+",          color: "#3b82f6", photo: PROGRAM_PHOTOS.plastic,    cat: "Plastic / EPR" },
  { id: "bluecarbon",title: "Blue Carbon",         subtitle: "Mangrove restoration · VCS",   color: "#0891b2", photo: PROGRAM_PHOTOS.bluecarbon, cat: "Blue Carbon" },
  { id: "biomass",   title: "Biomass & Clean Energy", subtitle: "AMS-I.C · Agri-residue to fuel", color: "#f59e0b", photo: PROGRAM_PHOTOS.biomass, cat: "Biomass" },
];

export default function ProgramsGrid({ setPage }) {
  return (
    <section style={{ padding: "80px 24px", background: T.bg0, borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 18 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#86efac", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>Our Programs</div>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(28px,4vw,38px)", fontWeight: 900, margin: 0, maxWidth: 700, lineHeight: 1.15 }}>
              Six credit categories, one trusted platform
            </h2>
          </div>
          <button
            onClick={() => setPage("marketplace")}
            style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.text2, fontSize: 13, fontWeight: 700, padding: "10px 18px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", letterSpacing: 0.5 }}
          >
            VIEW ALL →
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>
          {PROGRAMS.map((p) => (
            <ProgramCard key={p.id} program={p} onClick={() => setPage("marketplace")} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgramCard({ program, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        textAlign: "left",
        background: T.bg2,
        border: `1px solid ${T.border}`,
        borderRadius: 18,
        overflow: "hidden",
        cursor: "pointer",
        padding: 0,
        fontFamily: "inherit",
        transition: "transform .3s ease, border-color .2s, box-shadow .3s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = program.color + "66";
        e.currentTarget.style.boxShadow = `0 12px 40px ${program.color}22`;
        const img = e.currentTarget.querySelector("[data-pgrid-img]");
        if (img) img.style.transform = "scale(1.07)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.boxShadow = "none";
        const img = e.currentTarget.querySelector("[data-pgrid-img]");
        if (img) img.style.transform = "none";
      }}
    >
      <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
        <div
          data-pgrid-img
          style={{
            position: "absolute",
            inset: 0,
            transition: "transform .6s ease",
            ...bgImage(program.photo),
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(4,8,15,0.10) 0%, rgba(4,8,15,0.85) 100%)` }} />
        <div style={{ position: "absolute", top: 14, left: 14, background: program.color + "26", border: `1px solid ${program.color}66`, borderRadius: 999, padding: "4px 12px", fontSize: 10, fontWeight: 800, color: program.color, letterSpacing: 0.8, textTransform: "uppercase", backdropFilter: "blur(6px)" }}>
          Program
        </div>
      </div>

      <div style={{ padding: "20px 22px" }}>
        <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 800, color: T.text1, marginBottom: 6 }}>{program.title}</div>
        <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.5 }}>{program.subtitle}</div>
        <div style={{ marginTop: 14, fontSize: 12, fontWeight: 700, color: program.color, letterSpacing: 0.5 }}>EXPLORE →</div>
      </div>
    </button>
  );
}
