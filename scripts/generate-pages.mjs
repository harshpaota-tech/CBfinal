#!/usr/bin/env node
/**
 * Post-build: generate a static HTML file per route from dist/index.html,
 * each with its own baked-in SEO meta (title, description, canonical, OG/Twitter).
 *
 * Render serves clean URLs (/marketplace → marketplace.html), so this makes
 * every page work on direct visit + gives crawlers/social bots real per-page
 * meta tags — without needing any dashboard rewrite rule.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGE_SEO, SITE_URL } from "../src/lib/seo.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "../dist");
const OG_IMAGE = `${SITE_URL}/logo.png`;

const template = readFileSync(join(DIST, "index.html"), "utf8");

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function applyMeta(html, seo, url) {
  const title = esc(seo.title);
  const desc = esc(seo.description);
  const robots = seo.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1";

  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[\s\S]*?(")/i, `$1${desc}$2`)
    .replace(/(<meta\s+name="robots"\s+content=")[\s\S]*?(")/i, `$1${robots}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[\s\S]*?(")/i, `$1${url}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[\s\S]*?(")/i, `$1${title}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[\s\S]*?(")/i, `$1${desc}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[\s\S]*?(")/i, `$1${url}$2`)
    .replace(/(<meta\s+property="og:image"\s+content=")[\s\S]*?(")/i, `$1${OG_IMAGE}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[\s\S]*?(")/i, `$1${title}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[\s\S]*?(")/i, `$1${desc}$2`);
}

let count = 0;
for (const [id, seo] of Object.entries(PAGE_SEO)) {
  if (id === "home") continue; // index.html already covers "/"
  const url = `${SITE_URL}${seo.path}`;
  const out = applyMeta(template, seo, url);

  // /marketplace -> dist/marketplace.html ; /how-it-works -> dist/how-it-works.html
  const rel = seo.path.replace(/^\//, "");
  const file = join(DIST, `${rel}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, out, "utf8");
  count++;
}

console.log(`✓ Generated ${count} per-route HTML pages with baked-in SEO meta.`);
