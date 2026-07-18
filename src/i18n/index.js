import React, { createContext, useContext } from "react";
import tr from "./locales/tr.js";
import en from "./locales/en.js";
import ar from "./locales/ar.js";
import de from "./locales/de.js";
import fr from "./locales/fr.js";

export const locales = { tr, en, ar, de, fr };
export const DEFAULT_LANG = "tr";
const LANG_KEY = "feraiz.lang";

// Öncelik: ?lang= → localStorage → tarayıcı dili → tr
export function detectLang() {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (fromUrl && locales[fromUrl]) return fromUrl;
    const stored = localStorage.getItem(LANG_KEY);
    if (stored && locales[stored]) return stored;
    const nav = (navigator.language || "").slice(0, 2).toLowerCase();
    if (locales[nav]) return nav;
  } catch {
    // erişim engelliyse varsayılan
  }
  return DEFAULT_LANG;
}

export function persistLang(code) {
  try {
    localStorage.setItem(LANG_KEY, code);
  } catch {
    // storage kapalıysa sessizce geç
  }
}

// <html lang/dir> + başlık + meta + canonical + og + JSON-LD — dil değişince tümü güncellenir.
// Canonical her dilde kendi URL'sini gösterir; aksi hâlde Google dil sayfalarını
// TR'nin kopyası sayar ve indekslemez.
export function applySeo(L) {
  document.documentElement.lang = L.htmlLang;
  document.documentElement.dir = L.dir;
  document.title = L.seo.title;
  const set = (selector, attr, value) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  };
  const selfUrl = L.code === DEFAULT_LANG ? "https://feraiz.com/" : `https://feraiz.com/?lang=${L.code}`;
  set('link[rel="canonical"]', "href", selfUrl);
  set('meta[property="og:url"]', "content", selfUrl);
  set('meta[name="description"]', "content", L.seo.description);
  set('meta[property="og:title"]', "content", L.seo.title);
  set('meta[property="og:description"]', "content", L.seo.description);
  set('meta[property="og:locale"]', "content", L.seo.ogLocale);

  // Yapılandırılmış veri: uygulama tanımı + SSS (FAQPage)
  const setLd = (id, data) => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  };
  setLd("ld-app", {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: L.seo.title,
    url: selfUrl,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    inLanguage: Object.keys(locales),
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "TRY" },
    description: L.seo.description,
    image: "https://feraiz.com/og-image.png",
  });
  if (L.ui.faq?.length) {
    setLd("ld-faq", {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: L.htmlLang,
      mainEntity: L.ui.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
}

const LocaleContext = createContext({ L: tr, t: tr.ui, lang: DEFAULT_LANG, setLang: () => {} });

export function LocaleProvider({ value, children }) {
  return React.createElement(LocaleContext.Provider, { value }, children);
}

export function useLocale() {
  return useContext(LocaleContext);
}
