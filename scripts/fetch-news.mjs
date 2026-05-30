#!/usr/bin/env node
/**
 * Carbon Bridge — automated news aggregator
 * Real blog thumbnails + longer descriptions from publisher pages (not Google proxy images).
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleDecoder } from "google-news-url-decoder";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "../public/news-feed.json");
const EXCERPT_MAX = 560;

const RSS_SOURCES = [
  { id: "verra", name: "Verra", url: "https://verra.org/feed/", tag: "VERRA", type: "announcement", limit: 12 },
  { id: "carbon-brief", name: "Carbon Brief", url: "https://www.carbonbrief.org/feed/", tag: "CLIMATE", type: "esg", limit: 8 },
  { id: "esg-today", name: "ESG Today", url: "https://www.esgtoday.com/feed/", tag: "ESG", type: "esg", limit: 12 },
  { id: "esg-dive", name: "ESG Dive", url: "https://www.esgdive.com/feeds/news/", tag: "ESG", type: "esg", limit: 12 },
  {
    id: "google-india",
    name: "India Climate Policy",
    url: "https://news.google.com/rss/search?q=India+carbon+credits+climate+policy&hl=en-IN&gl=IN&ceid=IN:en",
    tag: "INDIA",
    type: "esg",
    limit: 10,
  },
  {
    id: "google-carbon",
    name: "Carbon Markets",
    url: "https://news.google.com/rss/search?q=voluntary+carbon+credits+Verra+Gold+Standard&hl=en&gl=US&ceid=US:en",
    tag: "CARBON MARKET",
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

const googleDecoder = new GoogleDecoder();

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
    .replace(/&hellip;/g, "…")
    .replace(/&[#\w]+;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function stripHtml(html) {
  return decodeEntities(String(html || ""))
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[\s*&hellip;\s*\]/g, "…")
    .replace(/\s+/g, " ")
    .trim();
}

function trimExcerpt(text, max = EXCERPT_MAX) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function extractRawTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1] : "";
}

function buildExcerptFromContent(rawEncoded, rawDescription, title) {
  if (rawEncoded) {
    const paragraphs = rawEncoded.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
    let combined = "";
    for (const p of paragraphs) {
      const t = stripHtml(p);
      if (t.length < 30) continue;
      combined += (combined ? " " : "") + t;
      if (combined.length >= EXCERPT_MAX) break;
    }
    if (combined.length >= 80) {
      return trimExcerpt(combined.replace(/The post .* appeared first on .*/gi, ""));
    }
  }

  const anchorMatch = rawDescription.match(/<a[^>]*>([\s\S]*?)<\/a>/i);
  let text = anchorMatch ? stripHtml(anchorMatch[1]) : stripHtml(rawDescription);
  text = text.replace(/The post .* appeared first on .*/gi, "").trim();

  if (!text || text.length < 30 || /^https?:\/\//i.test(text)) {
    text = title.replace(/\s*[-–|]\s*[^-|]+$/, "").trim();
  }

  return trimExcerpt(text);
}

function mergeExcerpt(current, ogDescription, bodySnippet, title) {
  const candidates = [bodySnippet, ogDescription, current, title.replace(/\s*[-–|]\s*[^-|]+$/, "")]
    .map((s) => stripHtml(s).replace(/The post .* appeared first on .*/gi, "").trim())
    .filter((s) => s.length >= 40 && !/^https?:\/\//i.test(s));

  candidates.sort((a, b) => b.length - a.length);
  return trimExcerpt(candidates[0] || current || title);
}

function extractImageFromBlock(block) {
  const media = block.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (media?.[1] && !isBadImage(media[1])) return media[1];

  const thumb = block.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i);
  if (thumb?.[1] && !isBadImage(thumb[1])) return thumb[1];

  for (const chunk of [extractRawTag(block, "content:encoded"), extractRawTag(block, "description")]) {
    if (!chunk) continue;
    const decoded = chunk.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
    for (const m of decoded.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
      if (!isBadImage(m[1])) return m[1].replace(/&amp;/g, "&");
    }
  }
  return null;
}

function isBadImage(url) {
  if (!url) return true;
  return (
    url.includes("ex_link") ||
    url.includes("favicon") ||
    url.endsWith(".svg") ||
    url.includes("googleusercontent.com") ||
    url.includes("gstatic.com/images")
  );
}

function isGoogleNewsUrl(url) {
  try {
    const u = new URL(url);
    return u.hostname === "news.google.com" && u.pathname.includes("/articles/");
  } catch {
    return false;
  }
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

function buildRegistryExcerpt(p) {
  const parts = [];
  parts.push(
    `${p.resourceName} is a Verified Carbon Standard (VCS) project registered on the Verra registry in ${p.country || "its host country"}.`
  );
  if (p.resourceStatus) parts.push(`The project is currently listed as "${p.resourceStatus}".`);
  if (p.protocols || p.protocolCategories) {
    parts.push(`It applies ${p.protocols || p.protocolCategories} methodology.`);
  }
  if (p.estAnnualEmissionReductions) {
    parts.push(
      `Estimated annual emission reductions are ${Number(p.estAnnualEmissionReductions).toLocaleString("en-IN")} tonnes CO₂ equivalent per year.`
    );
  }
  if (p.proponent) parts.push(`Project proponent: ${p.proponent}.`);
  if (p.creditingPeriodStartDate && p.creditingPeriodEndDate) {
    parts.push(`Crediting period runs ${p.creditingPeriodStartDate} to ${p.creditingPeriodEndDate}.`);
  }
  return trimExcerpt(parts.join(" "));
}

function parseRssItems(xml, source) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) && items.length < source.limit) {
    const block = match[1];
    const title = stripHtml(extractRawTag(block, "title"));
    const link = stripHtml(extractRawTag(block, "link")).replace(/&amp;/g, "&");
    const pubDate = stripHtml(extractRawTag(block, "pubDate"));
    const rawDescription = extractRawTag(block, "description");
    const rawEncoded = extractRawTag(block, "content:encoded");
    const category = stripHtml(extractRawTag(block, "category"));

    if (!title || !link) continue;

    const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
    const tag = inferTag(title, rawDescription, category, source.tag);
    const id = `${source.id}-${slugify(title).slice(0, 40)}-${publishedAt.slice(0, 10)}`;

    const article = {
      id,
      source: source.id,
      sourceName: source.name,
      type: source.type,
      tag,
      accent: TAG_ACCENTS[tag] || "#86efac",
      title,
      excerpt: buildExcerptFromContent(rawEncoded, rawDescription, title),
      url: link,
      publishedAt,
      image: extractImageFromBlock(block),
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
        "User-Agent": "Mozilla/5.0 (compatible; CarbonBridge-NewsBot/1.2; +https://thecarbonbridge.com)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function extractMetaContent(html, names) {
  for (const name of names) {
    const patterns = [
      new RegExp(`property=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
      new RegExp(`content=["']([^"']+)["'][^>]+property=["']${name}["']`, "i"),
      new RegExp(`name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
      new RegExp(`content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"),
    ];
    for (const p of patterns) {
      const m = html.match(p);
      if (m?.[1]) return decodeEntities(m[1].replace(/&amp;/g, "&"));
    }
  }
  return null;
}

function extractBodySnippet(html) {
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i);
  const scope = articleMatch ? articleMatch[0] : html;
  const paragraphs = scope.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
  let text = "";
  for (const p of paragraphs) {
    const t = stripHtml(p);
    if (t.length < 40) continue;
    text += (text ? " " : "") + t;
    if (text.length >= EXCERPT_MAX) break;
  }
  return text.trim();
}

async function fetchPageMeta(pageUrl) {
  const html = await fetchText(pageUrl, 14000);
  const image = extractMetaContent(html, ["og:image:secure_url", "og:image", "twitter:image"]);
  const description = extractMetaContent(html, ["og:description", "twitter:description", "description"]);
  const bodySnippet = extractBodySnippet(html);
  return {
    image: image && !isBadImage(image) ? image : null,
    description,
    bodySnippet,
  };
}

async function resolvePublisherUrl(article) {
  if (!isGoogleNewsUrl(article.url)) return article.url;
  try {
    const result = await googleDecoder.decode(article.url);
    if (result.status && result.decoded_url) {
      article.meta = { ...article.meta, googleNewsUrl: article.url };
      article.url = result.decoded_url;
      return result.decoded_url;
    }
  } catch {
    /* keep original */
  }
  return article.url;
}

async function enrichArticles(articles, { concurrency = 6 } = {}) {
  const queue = articles.filter(
    (a) =>
      isGoogleNewsUrl(a.url) ||
      isBadImage(a.image) ||
      !a.image ||
      (a.excerpt?.length || 0) < 180
  );

  let idx = 0;
  let resolved = 0;
  let images = 0;
  let expanded = 0;

  async function worker() {
    while (idx < queue.length) {
      const i = idx++;
      const article = queue[i];

      if (isGoogleNewsUrl(article.url)) {
        const before = article.url;
        await resolvePublisherUrl(article);
        if (article.url !== before) resolved++;
      }

      const needsMeta =
        isBadImage(article.image) || !article.image || (article.excerpt?.length || 0) < 180;

      if (needsMeta && article.url && !isGoogleNewsUrl(article.url)) {
        try {
          const meta = await fetchPageMeta(article.url);
          if (meta.image && (isBadImage(article.image) || !article.image)) {
            article.image = meta.image;
            article.meta = { ...article.meta, imageSource: "publisher" };
            images++;
          }
          const longer = mergeExcerpt(article.excerpt, meta.description, meta.bodySnippet, article.title);
          if (longer.length > (article.excerpt?.length || 0) + 20) {
            article.excerpt = longer;
            expanded++;
          }
        } catch {
          /* skip */
        }
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  console.log(
    `  ✓ Publisher enrichment: ${resolved} Google URLs decoded · ${images} blog thumbnails · ${expanded} longer descriptions`
  );
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
        "User-Agent": "CarbonBridge-NewsBot/1.2",
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
  const tag = p.country === "India" ? "INDIA" : "VCS PROJECT";

  const article = {
    id,
    source: "verra-registry",
    sourceName: "Verra VCS Registry",
    type: "registry",
    tag,
    accent: TAG_ACCENTS[tag] || "#86efac",
    title: p.resourceName,
    excerpt: buildRegistryExcerpt(p),
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
    const key = `${a.title.toLowerCase().slice(0, 60)}`;
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

  console.log("\n  Resolving Google links → publisher blogs + fetching real thumbnails…");
  await enrichArticles(all);

  for (const a of all) a.region = classifyRegion(a);

  const indiaArticles = all.filter((a) => a.region === "india");
  const worldArticles = all.filter((a) => a.region === "world");
  const publisherImages = all.filter((a) => a.image && !isBadImage(a.image)).length;

  const feed = {
    version: 3,
    fetchedAt: new Date().toISOString(),
    sources: [
      { id: "verra-registry", name: "Verra VCS Registry API", url: "https://registry.verra.org/" },
      ...RSS_SOURCES.map((s) => ({ id: s.id, name: s.name, url: s.url })),
    ],
    stats: {
      total: all.length,
      india: indiaArticles.length,
      world: worldArticles.length,
      withImages: publisherImages,
      avgExcerptLength: Math.round(all.reduce((s, a) => s + (a.excerpt?.length || 0), 0) / Math.max(all.length, 1)),
      verra: all.filter((a) => a.source === "verra").length,
      registry: all.filter((a) => a.source === "verra-registry").length,
      esg: all.filter((a) => a.type === "esg").length,
    },
    sections: { india: indiaArticles, world: worldArticles },
    articles: all,
  };

  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(feed, null, 2), "utf8");

  console.log(`\n✓ Wrote ${all.length} articles → public/news-feed.json`);
  console.log(
    `  🇮🇳 India: ${feed.stats.india} · 🌍 World: ${feed.stats.world} · 🖼 Publisher images: ${publisherImages} · Avg description: ${feed.stats.avgExcerptLength} chars`
  );
}

main().catch((err) => {
  console.error("News fetch failed:", err);
  process.exit(1);
});
