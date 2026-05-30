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
  NEWS_FILTERS,
  formatNewsDate,
} from "../lib/news.js";

export default function NewsBlog({ setPage }) {
  const { t } = useTranslation();
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
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

  const articles = useMemo(() => {
    if (!feed?.articles) return [];
    const filtered = filterArticles(feed.articles, filter);
    const searched = searchArticles(filtered, query);
    return searched.map(normalizeArticle);
  }, [feed, filter, query]);

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
        {/* Status bar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 13, color: T.text2 }}>
              {feed?.stats ? (
                <>
                  <strong style={{ color: "#86efac" }}>{feed.stats.total}</strong> live articles ·{" "}
                  {feed.stats.registry} VCS registry · {feed.stats.esg} ESG/GHG · {feed.stats.india} India
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

        {/* Filters + search */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 28, alignItems: "center" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {NEWS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  background: filter === f.id ? "rgba(34,197,94,0.15)" : T.bg2,
                  border: `1px solid ${filter === f.id ? "rgba(34,197,94,0.4)" : T.border}`,
                  color: filter === f.id ? "#86efac" : T.text2,
                  padding: "7px 14px",
                  borderRadius: 999,
                  fontSize: 12,
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

        {loading && (
          <div style={{ textAlign: "center", padding: 60, color: T.text3 }}>{t("news.loading")}</div>
        )}

        {error && !loading && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 14, padding: 20, color: "#fca5a5", marginBottom: 24 }}>
            {error}
          </div>
        )}

        {!loading && !error && articles.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: T.text3 }}>{t("news.noResults")}</div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 22 }}>
          {articles.map((item, i) => (
            <NewsCard key={item.id || i} item={item} onOpen={() => setSelected(item)} />
          ))}
        </div>

        {/* Source attribution */}
        {feed?.sources && (
          <div style={{ marginTop: 48, padding: "20px 24px", background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: T.text3, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>
              {t("news.sources")}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {feed.sources.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12, color: "#86efac", textDecoration: "none", padding: "4px 10px", border: `1px solid ${T.border}`, borderRadius: 999 }}
                >
                  {s.name} ↗
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      {selected && (
        <ArticleModal item={selected} onClose={() => setSelected(null)} />
      )}
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
        <div style={{ position: "absolute", inset: 0, ...bgImage(item.image) }} />
        <div style={{ position: "absolute", top: 12, left: 12, background: `${accent}22`, color: accent, border: `1px solid ${accent}66`, borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", backdropFilter: "blur(6px)" }}>
          {item.tag}
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
      <div
        style={{ background: T.bg1, border: `1px solid ${T.border}`, borderRadius: 20, maxWidth: 640, width: "100%", maxHeight: "85vh", overflow: "auto", padding: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
          <span style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}66`, borderRadius: 999, padding: "4px 12px", fontSize: 10, fontWeight: 800, letterSpacing: 0.6 }}>
            {item.tag}
          </span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.text3, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 24, lineHeight: 1.25, margin: "0 0 12px", color: T.text1 }}>
          {item.title}
        </h2>

        <div style={{ fontSize: 12, color: T.text3, marginBottom: 20 }}>
          {item.sourceName} · {formatNewsDate(item.publishedAt)}
        </div>

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
              <Btn variant="solid">
                {isRegistry ? "Open in Verra Registry ↗" : "Read Full Article ↗"}
              </Btn>
            </a>
          )}
          <Btn variant="ghost" onClick={onClose}>Close</Btn>
        </div>
      </div>
    </div>
  );
}

/** Compact card grid for the home page — shows latest 6 live articles. */
export function NewsPreview({ setPage, limit = 6 }) {
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchedAt, setFetchedAt] = useState(null);

  useEffect(() => {
    loadNewsFeed()
      .then((feed) => {
        setArticles((feed.articles || []).slice(0, limit).map(normalizeArticle));
        setFetchedAt(feed.fetchedAt);
      })
      .catch(() => setArticles([]))
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
                {t("news.autoFrom")} Verra RSS · Verra Registry API · ESG/GHG feeds · {t("news.lastUpdated")} {formatNewsDate(fetchedAt)}
              </p>
            )}
          </div>
          <Btn variant="outline" onClick={() => setPage("news")}>{t("news.viewAll")} →</Btn>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: T.text3 }}>{t("news.loading")}</div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: T.text3 }}>{t("news.noResults")}</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 22 }}>
            {articles.map((item, i) => (
              <NewsCard key={item.id || i} item={item} onOpen={() => {
                if (item.type === "registry" && item.url) window.open(item.url, "_blank", "noopener");
                else if (item.url) window.open(item.url, "_blank", "noopener");
                else setPage("news");
              }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
