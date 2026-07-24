/**
 * Lightweight per-page SEO head manager for the SPA.
 * Updates <title>, meta description, canonical, and Open Graph / Twitter tags
 * whenever the active page changes — so each route is shareable and indexable.
 */

export const SITE_URL = "https://thecarbonbridge.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;
const BRAND = "Carbon Bridge";

/** Per-page metadata. `noindex` pages are kept out of search results. */
export const PAGE_SEO = {
  home: {
    path: "/",
    title: "Carbon Credits India — Buy & Sell Verified Carbon Credits | Carbon Bridge",
    description:
      "Buy and sell verified carbon credits in India. Carbon Bridge is India's first environmental credit marketplace — Carbon, Soil, Plastic, CBG, Biogas and Green Hydrogen credits for CBG operators, FPOs and farmers.",
  },
  marketplace: {
    path: "/marketplace",
    title: "Buy Carbon Credits Online in India — Marketplace | Carbon Bridge",
    description:
      "Buy verified carbon credits in India — plus CBG/Biogas, Ocean Plastic, EPR, Soil Carbon, Blue Carbon and Green Hydrogen credits. Prices in ₹ and USD, filter by state and type.",
  },
  methodologies: {
    path: "/methodologies",
    title: "Carbon Credit Methodologies — Verra, Gold Standard & India Schemes | Carbon Bridge",
    description:
      "Explore carbon credit methodologies from Verra (VCS), Gold Standard, CPCB EPR, SATAT and India's National Green Hydrogen Mission. Full details on how credits are earned and verified.",
  },
  news: {
    path: "/news",
    title: "Carbon, ESG & GHG News — Live Updates | Carbon Bridge",
    description:
      "Live carbon market, ESG and GHG news from Verra, the VCS Registry, ESG Today, ESG Dive and Carbon Brief. India and World sections, updated automatically every day.",
  },
  howitworks: {
    path: "/how-it-works",
    title: "How Carbon Credits Work in India | Carbon Bridge",
    description:
      "Learn how environmental credits work — what they are, how they're verified on Verra and Gold Standard, who can buy them, and what retirement means. A simple guide for India.",
  },
  business: {
    path: "/for-business",
    title: "Carbon Credits for Business & ESG Reporting | Carbon Bridge",
    description:
      "Buy, retire and report verified carbon credits at scale. ESG-ready reporting, GST invoicing, volume pricing and registry-grade retirements for net-zero pledges in India.",
  },
  sell: {
    path: "/sell-credits",
    title: "Sell Your Carbon Credits — List Your Project | Carbon Bridge",
    description:
      "List your Verra, Gold Standard or India-scheme environmental project on Carbon Bridge. Reach buyers and companies retiring credits — apply, verify, list and get paid.",
  },
  login: {
    path: "/login",
    title: "Login | Carbon Bridge",
    description: "Sign in to your Carbon Bridge account to buy, retire and manage environmental credits.",
    noindex: true,
  },
  register: {
    path: "/register",
    title: "Create Account | Carbon Bridge",
    description: "Create a free Carbon Bridge account to buy and retire verified environmental credits.",
    noindex: true,
  },
  dashboard: {
    path: "/dashboard",
    title: "Dashboard | Carbon Bridge",
    description: "Your Carbon Bridge wallet, certificates and impact dashboard.",
    noindex: true,
  },
  checkout: {
    path: "/checkout",
    title: "Checkout | Carbon Bridge",
    description: "Complete your environmental credit purchase securely on Carbon Bridge.",
    noindex: true,
  },
};

/** Pages safe to expose in robots/sitemap. */
export const INDEXABLE_PAGES = Object.entries(PAGE_SEO)
  .filter(([, v]) => !v.noindex)
  .map(([id, v]) => ({ id, ...v }));

function upsertMeta(attr, key, content) {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel, href) {
  if (typeof document === "undefined") return;
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/** Apply SEO tags for a given page id. */
export function setPageSeo(pageId) {
  if (typeof document === "undefined") return;
  const seo = PAGE_SEO[pageId] || PAGE_SEO.home;
  const url = `${SITE_URL}${seo.path}`;
  const title = seo.title;

  document.title = title;
  upsertMeta("name", "description", seo.description);
  upsertMeta("name", "robots", seo.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
  upsertLink("canonical", url);

  upsertMeta("property", "og:title", title);
  upsertMeta("property", "og:description", seo.description);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:image", DEFAULT_OG_IMAGE);
  upsertMeta("property", "og:site_name", BRAND);

  upsertMeta("name", "twitter:title", title);
  upsertMeta("name", "twitter:description", seo.description);
  upsertMeta("name", "twitter:image", DEFAULT_OG_IMAGE);
}

/** Map a URL path back to a page id (for path-based routing). */
export function pageFromPath(pathname) {
  const clean = (pathname || "/").replace(/\/+$/, "") || "/";
  const match = Object.entries(PAGE_SEO).find(([, v]) => v.path === clean);
  return match ? match[0] : "home";
}

/** Get the URL path for a page id. */
export function pathForPage(pageId) {
  return PAGE_SEO[pageId]?.path || "/";
}
