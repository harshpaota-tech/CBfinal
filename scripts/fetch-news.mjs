#!/usr/bin/env node
/**
 * Carbon Bridge — automated news aggregator
 *
 * Pulls live content from:
 *   • Verra.org RSS (official announcements)
 *   • Verra Registry API (latest VCS project listings)
 *   • Google News RSS (carbon credits, ESG, GHG, green hydrogen)
 *   • Carbon Brief RSS (climate / emissions journalism)
 *
 * Writes public/news-feed.json — served by Vite and refreshed by
 * GitHub Actions every 6 hours (see .github/workflows/update-news.yml).
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "../public/news-feed.json");

const RSS_SOURCES = [
  {
    id: "verra",
    name: "Verra",
    url: "https://verra.org/feed/",
    tag: "VERRA",
    type: "announcement",
    limit: 12,
  },
  {
    id: "carbon-brief",
    name: "Carbon Brief",
    url: "https://www.carbonbrief.org/feed/",
    tag: "CLIMATE",
    type: "esg",
    limit: 8,
  },
  {
    id: "google-esg",
    name: "ESG & GHG News",
    url: "https://news.google.com/rss/search?q=ESG+GHG+carbon+emissions+sustainability&hl=en&gl=US&ceid=US:en",
    tag: "ESG",
    type: "esg",
    limit: 10,
  },
  {
    id: "google-carbon",
    name: "Carbon Markets",
    url: "https://news.google.com/rss/search?q=voluntary+carbon+credits+Verra+Gold+Standard&hl=en&gl=US&ceid=US:en",
    tag: "CARBON MARKET",
    type: "esg",
    limit: 10,
  },
  {
    id: "google-india",
    name: "India Climate Policy",
    url: "https://news.google.com/rss/search?q=India+carbon+credits+climate+policy&hl=en-IN&gl=IN&ceid=IN:en",
    tag: "INDIA",
    type: "esg",
    limit: 8,
  },
  {
    id: "google-h2",
    name: "Green Hydrogen",
    url: "https://news.google.com/rss/search?q=green+hydrogen+carbon+credits+NGHM&hl=en&gl=US&ceid=US:en",
    tag: "GREEN HYDROGEN",
    type: "esg",
    limit: 6,
  },
];

const NEWS_PHOTOS = [
  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1500076656116-558758c991c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1518837695005-2083093ee35b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
];

const TAG_ACCENTS = {
  VERRA: "#86efac",
  "VCS PROJECT": "#86efac",
  ESG: "#60a5fa",
  "CARBON MARKET": "#a78bfa",
  CLIMATE: "#34d399",
  INDIA: "#fbbf24",
  "GREEN HYDROGEN": "#5eead4",
  REGISTRY: "#86efac",
  POLICY: "#5eead4",
  ANNOUNCEMENT: "#86efac",
};

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!m) return "";
  return stripHtml(m[1]);
}

function parseRssItems(xml, source) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) && items.length < source.limit) {
    const block = match[1];
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate");
    const description = extractTag(block, "description");
    const category = extractTag(block, "category");

    if (!title || !link) continue;

    const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
    const tag = inferTag(title, description, category, source.tag);
    const id = `${source.id}-${slugify(title).slice(0, 40)}-${publishedAt.slice(0, 10)}`;

    items.push({
      id,
      source: source.id,
      sourceName: source.name,
      type: source.type,
      tag,
      accent: TAG_ACCENTS[tag] || "#86efac",
      title,
      excerpt: description.slice(0, 280) + (description.length > 280 ? "…" : ""),
      url: link,
      publishedAt,
      image: pickPhoto(title + tag),
      country: tag === "INDIA" || /india/i.test(title) ? "India" : null,
      methodology: null,
      registryId: null,
      status: null,
      meta: { category: category || null, feed: source.url },
    });
  }

  return items;
}

function inferTag(title, description, category, defaultTag) {
  const text = `${title} ${description} ${category}`.toLowerCase();
  if (/green hydrogen|nghm|electrolyzer|sight/i.test(text)) return "GREEN HYDROGEN";
  if (/india|indian|cpcb|satat|nghm|seci|bis is/i.test(text)) return "INDIA";
  if (/verra|vcs|vm00|vcu|verified carbon/i.test(text)) return "VERRA";
  if (/gold standard|gs4gg|carbon credit|offset|voluntary carbon/i.test(text)) return "CARBON MARKET";
  if (/esg|ghg|emission|net.?zero|sustainability/i.test(text)) return "ESG";
  if (/climate|cop\d|warming|decarbon/i.test(text)) return "CLIMATE";
  if (/policy|regulation|compliance|epr/i.test(text)) return "POLICY";
  return defaultTag;
}

function pickPhoto(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return NEWS_PHOTOS[hash % NEWS_PHOTOS.length];
}

async function fetchText(url, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CarbonBridge-NewsBot/1.0 (+https://thecarbonbridge.com)",
        Accept: "application/rss+xml, application/xml, text/xml, application/json, */*",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchRssSource(source) {
  try {
    const xml = await fetchText(source.url);
    const items = parseRssItems(xml, source);
    console.log(`  ✓ ${source.name}: ${items.length} articles`);
    return items;
  } catch (err) {
    console.warn(`  ✗ ${source.name}: ${err.message}`);
    return [];
  }
}

async function fetchVerraRegistryProjects() {
  const url =
    "https://registry.verra.org/uiapi/resource/resource/search?$skip=0&$top=25&count=true&$orderby=createDate%20desc";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    const res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "CarbonBridge-NewsBot/1.0",
      },
      body: JSON.stringify({ program: "VCS" }),
    });
    clearTimeout(timer);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const projects = (data.value || []).map(mapVerraProject);
    console.log(`  ✓ Verra Registry API: ${projects.length} projects`);
    return projects;
  } catch (err) {
    console.warn(`  ✗ Verra Registry API: ${err.message}`);
    return [];
  }
}

function mapVerraProject(p) {
  const id = `verra-vcs-${p.resourceIdentifier}`;
  const reductions = p.estAnnualEmissionReductions
    ? `${Number(p.estAnnualEmissionReductions).toLocaleString("en-IN")} tCO₂e/yr`
    : "—";
  const tag = p.country === "India" ? "INDIA" : "VCS PROJECT";

  return {
    id,
    source: "verra-registry",
    sourceName: "Verra VCS Registry",
    type: "registry",
    tag,
    accent: TAG_ACCENTS[tag] || "#86efac",
    title: p.resourceName,
    excerpt: [
      p.country,
      p.resourceStatus,
      p.protocols || p.protocolCategories,
      reductions,
    ]
      .filter(Boolean)
      .join(" · "),
    url: `https://registry.verra.org/app/projectDetail/VCS/${p.resourceIdentifier}`,
    publishedAt: p.createDate
      ? new Date(p.createDate).toISOString()
      : new Date().toISOString(),
    image: pickPhoto(p.resourceName + p.country),
    country: p.country || null,
    methodology: p.protocols || p.protocolCategories || null,
    registryId: p.resourceIdentifier,
    status: p.resourceStatus || null,
    meta: {
      proponent: p.proponent,
      region: p.region,
      creditingPeriodStart: p.creditingPeriodStartDate,
      creditingPeriodEnd: p.creditingPeriodEndDate,
      program: p.program,
    },
  };
}

function dedupeArticles(articles) {
  const seen = new Set();
  return articles.filter((a) => {
    const key = `${a.title.toLowerCase().slice(0, 60)}|${a.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  console.log("Carbon Bridge — fetching live news feeds…\n");

  const rssResults = await Promise.all(RSS_SOURCES.map(fetchRssSource));
  const registryProjects = await fetchVerraRegistryProjects();

  const all = dedupeArticles([...registryProjects, ...rssResults.flat()]);
  all.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  const feed = {
    version: 1,
    fetchedAt: new Date().toISOString(),
    sources: [
      { id: "verra-registry", name: "Verra VCS Registry API", url: "https://registry.verra.org/" },
      ...RSS_SOURCES.map((s) => ({ id: s.id, name: s.name, url: s.url })),
    ],
    stats: {
      total: all.length,
      verra: all.filter((a) => a.source === "verra").length,
      registry: all.filter((a) => a.source === "verra-registry").length,
      esg: all.filter((a) => a.type === "esg").length,
      india: all.filter((a) => a.country === "India" || a.tag === "INDIA").length,
    },
    articles: all,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(feed, null, 2), "utf8");

  console.log(`\n✓ Wrote ${all.length} articles → public/news-feed.json`);
  console.log(`  Stats: ${feed.stats.registry} registry · ${feed.stats.verra} Verra · ${feed.stats.esg} ESG · ${feed.stats.india} India`);
}

main().catch((err) => {
  console.error("News fetch failed:", err);
  process.exit(1);
});
