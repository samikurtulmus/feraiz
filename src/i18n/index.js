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

// <html lang/dir> + başlık + meta açıklama + og etiketleri
export function applySeo(L) {
  document.documentElement.lang = L.htmlLang;
  document.documentElement.dir = L.dir;
  document.title = L.seo.title;
  const set = (selector, attr, value) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute(attr, value);
  };
  set('meta[name="description"]', "content", L.seo.description);
  set('meta[property="og:title"]', "content", L.seo.title);
  set('meta[property="og:description"]', "content", L.seo.description);
  set('meta[property="og:locale"]', "content", L.seo.ogLocale);
}

const LocaleContext = createContext({ L: tr, t: tr.ui, lang: DEFAULT_LANG, setLang: () => {} });

export function LocaleProvider({ value, children }) {
  return React.createElement(LocaleContext.Provider, { value }, children);
}

export function useLocale() {
  return useContext(LocaleContext);
}
