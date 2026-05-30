#!/usr/bin/env node
/**
 * Carbon Bridge — automated news aggregator
 *
 * Pulls live content from Verra RSS, Verra Registry API, Google News, Carbon Brief.
 * Extracts REAL article images (RSS media / og:image) — no stock photo placeholders.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "../public/news-feed.json");

const RSS_SOURCES = [
  { id: "verra", name: "Verra", url: "https://verra.org/feed/", tag: "VERRA", type: "announcement", limit: 12 },
  { id: "carbon-brief", name: "Carbon Brief", url: "https://www.carbonbrief.org/feed/", tag: "CLIMATE", type: "esg", limit: 8 },
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
    limit: 10,
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

const TAG_ACCENTS = {
  VERRA: "#86efac",
  "VCS PROJECT": "#86efac",
  ESG: "#60a5fa",
  "CARBON MARKET": "#a78bfa",
  CLIMATE: "#34d399",
  INDIA: "#fbbf24",
  "GREEN HYDROGEN": "#5eead4",
  POLICY: "#5eead4",
  ANNOUNCEMENT: "#86efac",
};

const INDIA_KEYWORDS =
  /\bindia\b|\bindian\b|cpcb|satat|nghm|seci|gujarat|maharashtra|tamil nadu|jharkhand|west bengal|karnataka|odisha|rajasthan|delhi|mumbai|bangalore|chennai|hyderabad|kolkata|pune|biogas|cbg\b|epr portal|bis is/i;

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function decodeEntities(text) {
  return String(text || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function stripHtml(html) {
  return decodeEntities(String(html || ""))
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractRawTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1] : "";
}

function extractExcerpt(rawDescription, title) {
  const anchorMatch = rawDescription.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
  let text = anchorMatch ? stripHtml(anchorMatch[1]) : stripHtml(rawDescription);

  text = text
    .replace(/The post .* appeared first on .*/gi, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  if (!text || text.length < 24 || /^https?:\/\//i.test(text)) {
    text = title.replace(/\s*[-–|]\s*[^-|]+$/, "").trim();
  }

  return text.length > 280 ? `${text.slice(0, 277)}…` : text;
}

function extractImageFromBlock(block) {
  const media = block.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (media?.[1]) return media[1];

  const thumb = block.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
  if (thumb?.[1]) return thumb[1];

  const enclosure = block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image/i);
  if (enclosure?.[1]) return enclosure[1];

  for (const chunk of [extractRawTag(block, "content:encoded"), extractRawTag(block, "description")]) {
    if (!chunk) continue;
    for (const m of chunk.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
      const src = m[1];
      if (!src.includes("ex_link") && !src.includes("favicon") && !src.endsWith(".svg")) return src;
    }
  }
  return null;
}

function inferTag(title, description, category, defaultTag) {
  const text = `${title} ${description} ${category}`.toLowerCase();
  if (/green hydrogen|nghm|electrolyzer|sight/i.test(text)) return "GREEN HYDROGEN";
  if (INDIA_KEYWORDS.test(text)) return "INDIA";
  if (/verra|vcs|vm00|vcu|verified carbon/i.test(text)) return "VERRA";
  if (/gold standard|gs4gg|carbon credit|offset|voluntary carbon/i.test(text)) return "CARBON MARKET";
  if (/esg|ghg|emission|net.?zero|sustainability/i.test(text)) return "ESG";
  if (/climate|cop\d|warming|decarbon/i.test(text)) return "CLIMATE";
  if (/policy|regulation|compliance|epr/i.test(text)) return "POLICY";
  return defaultTag;
}

function classifyRegion(article) {
  if (article.country === "India") return "india";
  if (article.tag === "INDIA") return "india";
  if (article.source === "google-india") return "india";
  const text = `${article.title} ${article.excerpt}`;
  if (INDIA_KEYWORDS.test(text)) return "india";
  return "world";
}

function parseRssItems(xml, source) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) && items.length < source.limit) {
    const block = match[1];
    const title = stripHtml(extractRawTag(block, "title"));
    const link = stripHtml(extractRawTag(block, "link"));
    const pubDate = stripHtml(extractRawTag(block, "pubDate"));
    const rawDescription = extractRawTag(block, "description");
    const category = stripHtml(extractRawTag(block, "category"));

    if (!title || !link) continue;

    const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
    const tag = inferTag(title, rawDescription, category, source.tag);
    const id = `${source.id}-${slugify(title).slice(0, 40)}-${publishedAt.slice(0, 10)}`;
    const excerpt = extractExcerpt(rawDescription, title);
    const image = extractImageFromBlock(block);

    const article = {
      id,
      source: source.id,
      sourceName: source.name,
      type: source.type,
      tag,
      accent: TAG_ACCENTS[tag] || "#86efac",
      title,
      excerpt,
      url: link,
      publishedAt,
      image,
      country: tag === "INDIA" || INDIA_KEYWORDS.test(title) ? "India" : null,
      methodology: null,
      registryId: null,
      status: null,
      meta: { category: category || null, feed: source.url },
    };
    article.region = classifyRegion(article);
    items.push(article);
  }

  return items;
}

async function fetchText(url, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CarbonBridge-NewsBot/1.1; +https://thecarbonbridge.com)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchOgImage(pageUrl) {
  try {
    const html = await fetchText(pageUrl, 14000);
    const patterns = [
      /property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    ];
    for (const pattern of patterns) {
      const m = html.match(pattern);
      if (m?.[1] && !m[1].includes("ex_link.svg") && !m[1].includes("favicon")) {
        return m[1].replace(/&amp;/g, "&");
      }
    }
    const imgMatch = html.match(/<img[^>]+src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i);
    if (imgMatch?.[1] && !imgMatch[1].includes("ex_link")) return imgMatch[1].replace(/&amp;/g, "&");
  } catch {
    /* skip */
  }
  return null;
}

async function enrichImages(articles, { concurrency = 8 } = {}) {
  const queue = articles.filter((a) => !a.image && a.url);
  let idx = 0;
  let enriched = 0;

  async function worker() {
    while (idx < queue.length) {
      const i = idx++;
      const article = queue[i];
      const img = await fetchOgImage(article.url);
      if (img) {
        article.image = img;
        article.meta = { ...article.meta, imageSource: "og:image" };
        enriched++;
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  console.log(`  ✓ Image enrichment: ${enriched}/${queue.length} articles got real thumbnails`);
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
        "User-Agent": "CarbonBridge-NewsBot/1.1",
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

  const article = {
    id,
    source: "verra-registry",
    sourceName: "Verra VCS Registry",
    type: "registry",
    tag,
    accent: TAG_ACCENTS[tag] || "#86efac",
    title: p.resourceName,
    excerpt: [p.country, p.resourceStatus, p.protocols || p.protocolCategories, reductions]
      .filter(Boolean)
      .join(" · "),
    url: `https://registry.verra.org/app/projectDetail/VCS/${p.resourceIdentifier}`,
    publishedAt: p.createDate ? new Date(p.createDate).toISOString() : new Date().toISOString(),
    image: null,
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
  article.region = classifyRegion(article);
  return article;
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

  console.log("\n  Enriching missing images from article pages…");
  await enrichImages(all);

  // Re-classify regions after enrichment
  for (const a of all) a.region = classifyRegion(a);

  const indiaArticles = all.filter((a) => a.region === "india");
  const worldArticles = all.filter((a) => a.region === "world");

  const feed = {
    version: 2,
    fetchedAt: new Date().toISOString(),
    sources: [
      { id: "verra-registry", name: "Verra VCS Registry API", url: "https://registry.verra.org/" },
      ...RSS_SOURCES.map((s) => ({ id: s.id, name: s.name, url: s.url })),
    ],
    stats: {
      total: all.length,
      india: indiaArticles.length,
      world: worldArticles.length,
      withImages: all.filter((a) => a.image).length,
      verra: all.filter((a) => a.source === "verra").length,
      registry: all.filter((a) => a.source === "verra-registry").length,
      esg: all.filter((a) => a.type === "esg").length,
    },
    sections: {
      india: indiaArticles,
      world: worldArticles,
    },
    articles: all,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(feed, null, 2), "utf8");

  console.log(`\n✓ Wrote ${all.length} articles → public/news-feed.json`);
  console.log(
    `  🇮🇳 India: ${feed.stats.india} · 🌍 World: ${feed.stats.world} · 🖼 Real images: ${feed.stats.withImages}/${feed.stats.total}`
  );
}

main().catch((err) => {
  console.error("News fetch failed:", err);
  process.exit(1);
});
