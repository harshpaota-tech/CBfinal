import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { T } from "../theme.js";
import { bgImage } from "../data/media.js";
import Btn from "./ui/Btn.jsx";
import PageBanner from "./ui/PageBanner.jsx";
import {
  loadNewsFeed,
  filterArticles,
  searchArticles,
  normalizeArticle,
  getArticlesByRegion,
  NEWS_REGIONS,
  NEWS_FILTERS,
  formatNewsDate,
} from "../lib/news.js";

export default function NewsBlog({ setPage }) {
  const { t } = useTranslation();
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [region, setRegion] = useState("all");
  const [topic, setTopic] = useState("all-topics");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (force = false) => {
    try {
      setError("");
      const data = await loadNewsFeed({ force });
      setFeed(data);
    } catch (err) {
      setError(err.message || "Failed to load news");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const applyFilters = useCallback(
    (list) => searchArticles(filterArticles(list.map(normalizeArticle), topic), query),
    [topic, query]
  );

  const indiaArticles = useMemo(
    () => (feed ? applyFilters(getArticlesByRegion(feed, "india")) : []),
    [feed, applyFilters]
  );
  const worldArticles = useMemo(
    () => (feed ? applyFilters(getArticlesByRegion(feed, "world")) : []),
    [feed, applyFilters]
  );
  const allArticles = useMemo(
    () => (feed ? applyFilters(feed.articles || []) : []),
    [feed, applyFilters]
  );

  const handleRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  return (
    <div className="fade">
      <PageBanner
        tag={t("news.tag")}
        title={t("news.title")}
        subtitle={t("news.subtitle")}
        photo="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
      />

      <section style={{ padding: "48px 24px 80px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 13, color: T.text2 }}>
              {feed?.stats ? (
                <>
                  <strong style={{ color: "#fbbf24" }}>{feed.stats.india ?? 0}</strong> India ·{" "}
                  <strong style={{ color: "#60a5fa" }}>{feed.stats.world ?? 0}</strong> World ·{" "}
                  <strong style={{ color: "#86efac" }}>{feed.stats.withImages ?? 0}</strong> with real article images
                </>
              ) : (
                t("news.loadingStats")
              )}
            </div>
            {feed?.fetchedAt && (
              <div style={{ fontSize: 11, color: T.text3, marginTop: 4 }}>
                {t("news.lastUpdated")}: {formatNewsDate(feed.fetchedAt)} · {t("news.autoRefresh")}
              </div>
            )}
          </div>
          <Btn variant="outline" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? t("news.refreshing") : t("news.refresh")}
          </Btn>
        </div>

        {/* India / World primary tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          {NEWS_REGIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => setRegion(r.id)}
              style={{
                background: region === r.id ? "rgba(34,197,94,0.18)" : T.bg2,
                border: `1px solid ${region === r.id ? "rgba(34,197,94,0.45)" : T.border}`,
                color: region === r.id ? "#86efac" : T.text2,
                padding: "10px 20px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {r.emoji ? `${r.emoji} ` : ""}{r.label}
              {feed?.stats && r.id === "india" && ` (${feed.stats.india ?? 0})`}
              {feed?.stats && r.id === "world" && ` (${feed.stats.world ?? 0})`}
            </button>
          ))}
        </div>

        {/* Topic filters + search */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 32, alignItems: "center" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {NEWS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setTopic(f.id)}
                style={{
                  background: topic === f.id ? "rgba(96,165,250,0.12)" : T.bg2,
                  border: `1px solid ${topic === f.id ? "rgba(96,165,250,0.35)" : T.border}`,
                  color: topic === f.id ? "#93c5fd" : T.text3,
                  padding: "6px 12px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("news.searchPlaceholder")}
            style={{
              flex: "1 1 220px",
              minWidth: 200,
              background: T.bg2,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: "10px 14px",
              color: T.text1,
              fontSize: 13,
              fontFamily: "inherit",
            }}
          />
        </div>

        {loading && <div style={{ textAlign: "center", padding: 60, color: T.text3 }}>{t("news.loading")}</div>}

        {error && !loading && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 14, padding: 20, color: "#fca5a5", marginBottom: 24 }}>
            {error}
          </div>
        )}

        {!loading && !error && region === "all" && (
          <>
            <NewsSectionBlock
              emoji="🇮🇳"
              title={t("news.indiaSection")}
              subtitle={t("news.indiaSectionSub")}
              articles={indiaArticles}
              onSelect={setSelected}
              accent="#fbbf24"
            />
            <NewsSectionBlock
              emoji="🌍"
              title={t("news.worldSection")}
              subtitle={t("news.worldSectionSub")}
              articles={worldArticles}
              onSelect={setSelected}
              accent="#60a5fa"
            />
          </>
        )}

        {!loading && !error && region === "india" && (
          <NewsSectionBlock
            emoji="🇮🇳"
            title={t("news.indiaSection")}
            subtitle={t("news.indiaSectionSub")}
            articles={indiaArticles}
            onSelect={setSelected}
            accent="#fbbf24"
            solo
          />
        )}

        {!loading && !error && region === "world" && (
          <NewsSectionBlock
            emoji="🌍"
            title={t("news.worldSection")}
            subtitle={t("news.worldSectionSub")}
            articles={worldArticles}
            onSelect={setSelected}
            accent="#60a5fa"
            solo
          />
        )}

        {!loading && !error && region !== "all" && (region === "india" ? indiaArticles : worldArticles).length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: T.text3 }}>{t("news.noResults")}</div>
        )}

        {feed?.sources && (
          <div style={{ marginTop: 48, padding: "20px 24px", background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.text3, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
              {t("news.sources")}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {feed.sources.map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#86efac", textDecoration: "none", padding: "4px 10px", border: `1px solid ${T.border}`, borderRadius: 999 }}>
                  {s.name} ↗
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {selected && <ArticleModal item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function NewsSectionBlock({ emoji, title, subtitle, articles, onSelect, accent, solo = false }) {
  if (!articles.length) return null;

  return (
    <div style={{ marginBottom: solo ? 0 : 56 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>{emoji}</span>
        <div>
          <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 26, margin: 0, color: T.text1 }}>{title}</h2>
          <p style={{ fontSize: 13, color: T.text3, margin: "4px 0 0" }}>{subtitle}</p>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: accent }}>{articles.length} articles</div>
      </div>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${accent}88, transparent)`, marginBottom: 24, borderRadius: 2 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 22 }}>
        {articles.map((item, i) => (
          <NewsCard key={item.id || i} item={item} onOpen={() => onSelect(item)} />
        ))}
      </div>
    </div>
  );
}

function ArticleImage({ item }) {
  if (item.image) {
    return (
      <div
        style={{ position: "absolute", inset: 0, ...bgImage(item.image), backgroundSize: "cover", backgroundPosition: "center" }}
        role="img"
        aria-label={item.title}
      />
    );
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(145deg, ${item.accent}18 0%, ${T.bg1} 60%, ${T.bg2} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        padding: 20,
        textAlign: "center",
      }}
    >
      <span style={{ fontSize: 36 }}>{item.region === "india" ? "🇮🇳" : "🌍"}</span>
      <span style={{ fontSize: 11, fontWeight: 800, color: item.accent, letterSpacing: 1, textTransform: "uppercase" }}>
        {item.sourceName}
      </span>
      <span style={{ fontSize: 10, color: T.text3 }}>No preview image · open article</span>
    </div>
  );
}

function NewsCard({ item, onOpen }) {
  const accent = item.accent || "#86efac";
  const isExternal = item.type !== "registry";

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
      onClick={onOpen}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = accent + "59";
        e.currentTarget.style.boxShadow = `0 12px 40px ${accent}26`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.borderColor = T.border;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
        <ArticleImage item={item} />
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}66`, borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", backdropFilter: "blur(6px)" }}>
            {item.tag}
          </span>
          {item.region && (
            <span style={{ background: "rgba(0,0,0,0.5)", color: T.text1, borderRadius: 999, padding: "3px 8px", fontSize: 10, fontWeight: 700, backdropFilter: "blur(6px)" }}>
              {item.region === "india" ? "🇮🇳 India" : "🌍 World"}
            </span>
          )}
        </div>
        {item.sourceName && (
          <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.55)", color: T.text2, borderRadius: 8, padding: "3px 8px", fontSize: 10, fontWeight: 600, backdropFilter: "blur(4px)" }}>
            {item.sourceName}
          </div>
        )}
      </div>
      <div style={{ padding: "22px 24px" }}>
        <div style={{ fontSize: 11, color: T.text3, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 12 }}>
          {item.date || formatNewsDate(item.publishedAt)}
        </div>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 18, lineHeight: 1.3, color: T.text1, margin: "0 0 10px" }}>
          {item.title}
        </h3>
        <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65, margin: 0 }}>{item.excerpt}</p>
        <div style={{ marginTop: 14, fontSize: 12, fontWeight: 700, color: accent }}>
          {isExternal ? "READ ARTICLE →" : "VIEW PROJECT →"}
        </div>
      </div>
    </article>
  );
}

function ArticleModal({ item, onClose }) {
  const accent = item.accent || "#86efac";
  const isRegistry = item.type === "registry";

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <div style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 20, maxWidth: 640, width: "100%", maxHeight: "85vh", overflow: "auto", padding: 28 }} onClick={(e) => e.stopPropagation()}>
        {item.image && (
          <div style={{ borderRadius: 14, overflow: "hidden", aspectRatio: "16/9", marginBottom: 20, ...bgImage(item.image) }} />
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
          <span style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}66`, borderRadius: 999, padding: "4px 12px", fontSize: 10, fontWeight: 800, letterSpacing: 0.6 }}>
            {item.tag} · {item.region === "india" ? "🇮🇳 India" : "🌍 World"}
          </span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.text3, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 24, lineHeight: 1.25, margin: "0 0 12px", color: T.text1 }}>{item.title}</h2>
        <div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>{item.sourceName} · {formatNewsDate(item.publishedAt)}</div>
        <p style={{ fontSize: 14, color: T.text2, lineHeight: 1.7, margin: "0 0 20px" }}>{item.excerpt}</p>
        {isRegistry && (
          <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, marginBottom: 20, fontSize: 13, color: T.text2, lineHeight: 1.8 }}>
            {item.registryId && <div><strong style={{ color: T.text1 }}>VCS ID:</strong> {item.registryId}</div>}
            {item.country && <div><strong style={{ color: T.text1 }}>Country:</strong> {item.country}</div>}
            {item.status && <div><strong style={{ color: T.text1 }}>Status:</strong> {item.status}</div>}
            {item.methodology && <div><strong style={{ color: T.text1 }}>Methodology:</strong> {item.methodology}</div>}
            {item.meta?.proponent && <div><strong style={{ color: T.text1 }}>Proponent:</strong> {item.meta.proponent}</div>}
          </div>
        )}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {item.url && (
            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <Btn variant="solid">{isRegistry ? "Open in Verra Registry ↗" : "Read Full Article ↗"}</Btn>
            </a>
          )}
          <Btn variant="ghost" onClick={onClose}>Close</Btn>
        </div>
      </div>
    </div>
  );
}

/** Home page preview — India + World sections, 3 cards each */
export function NewsPreview({ setPage, limit = 3 }) {
  const { t } = useTranslation();
  const [india, setIndia] = useState([]);
  const [world, setWorld] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState(null);

  useEffect(() => {
    loadNewsFeed()
      .then((feed) => {
        const norm = (list) => (list || []).slice(0, limit).map(normalizeArticle);
        setIndia(norm(feed.sections?.india || feed.articles?.filter((a) => a.region === "india")));
        setWorld(norm(feed.sections?.world || feed.articles?.filter((a) => a.region === "world")));
        setFetchedAt(feed.fetchedAt);
      })
      .catch(() => {
        setIndia([]);
        setWorld([]);
      })
      .finally(() => setLoading(false));
  }, [limit]);

  return (
    <section style={{ padding: "80px 24px", background: T.bg0 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, flexWrap: "wrap", gap: 18 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#86efac", letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
              {t("news.liveTag")}
            </div>
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: "clamp(28px,4vw,38px)", fontWeight: 900, margin: 0, lineHeight: 1.15 }}>
              {t("news.previewTitle")}
            </h2>
            {fetchedAt && (
              <p style={{ fontSize: 12, color: T.text3, marginTop: 8, marginBottom: 0 }}>
                {t("news.realImagesNote")} · {t("news.lastUpdated")} {formatNewsDate(fetchedAt)}
              </p>
            )}
          </div>
          <Btn variant="outline" onClick={() => setPage("news")}>{t("news.viewAll")} →</Btn>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: T.text3 }}>{t("news.loading")}</div>
        ) : (
          <>
            <MiniSection emoji="🇮🇳" title={t("news.indiaSection")} articles={india} setPage={setPage} />
            <MiniSection emoji="🌍" title={t("news.worldSection")} articles={world} setPage={setPage} />
          </>
        )}
      </div>
    </section>
  );
}

function MiniSection({ emoji, title, articles, setPage }) {
  if (!articles.length) return null;
  return (
    <div style={{ marginBottom: 48 }}>
      <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 20, margin: "0 0 16px", color: T.text1, display: "flex", alignItems: "center", gap: 10 }}>
        <span>{emoji}</span> {title}
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
        {articles.map((item, i) => (
          <NewsCard key={item.id || i} item={item} onOpen={() => {
            if (item.url) window.open(item.url, "_blank", "noopener");
            else setPage("news");
          }} />
        ))}
      </div>
    </div>
  );
}
