import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translations from "./translations.js";

export const STORAGE_KEY = "cb-lang";
export const SUPPORTED_LANGS = ["en", "hi"];

function detectInitialLang() {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
  } catch {
    // localStorage may be blocked (private browsing etc.) — silently fall back.
  }
  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  return SUPPORTED_LANGS.includes(browser) ? browser : "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translations.en },
    hi: { translation: translations.hi },
  },
  lng: detectInitialLang(),
  fallbackLng: "en",
  interpolation: { escapeValue: false }, // React already escapes
  returnEmptyString: false,
});

export function setLanguage(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  i18n.changeLanguage(lang);
  if (typeof window !== "undefined") {
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch {}
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
  }
}

// Sync <html lang="..."> on init so screen readers + browser translate
// know what language the page actually is.
if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language;
}

export default i18n;
