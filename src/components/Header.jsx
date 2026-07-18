import React from "react";
import { locales, useLocale } from "../i18n/index.js";

export default function Header({ onOpenAbout, theme, onToggleTheme }) {
  const { t, lang, setLang } = useLocale();
  return (
    <header className="no-print sticky top-0 z-10 bg-primary text-light shadow-md w-full pt-[env(safe-area-inset-top)]">
      <div className="relative max-w-6xl mx-auto px-4 py-5 text-center pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {/* Geniş ekran: tema + dil sağ üst köşede (RTL'de sola geçer) */}
        <div className="hidden sm:flex absolute end-4 top-4 items-center gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="h-9 rounded-full bg-white/10 hover:bg-white/20 text-light text-sm px-2 border-0 focus:outline-none focus:ring-2 focus:ring-white/40 [&>option]:text-ink"
            title={t.langLabel}
            aria-label={t.langLabel}
          >
            {Object.values(locales).map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
            title={theme === "dark" ? t.themeToLight : t.themeToDark}
            aria-label={theme === "dark" ? t.themeToLight : t.themeToDark}
          >
            <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`} aria-hidden="true"></i>
          </button>
        </div>
        <div className="flex items-center justify-center gap-3">
          <i className="fas fa-balance-scale text-xl" aria-hidden="true"></i>
          <h1 className="text-3xl font-extrabold tracking-wide">Feraiz.com</h1>
        </div>
        <p className="opacity-90 mt-1">{t.tagline}</p>
        <nav className="mt-3">
          <div className="px-4">
            <ul className="flex gap-4 text-sm flex-wrap justify-center w-full">
              <li><a href={import.meta.env.BASE_URL + 'meal/'} className="hover:underline text-light">{t.navVerses}</a></li>
              <li>
                <a
                  href="https://ayet.cc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-light"
                >
                  <span className="md:hidden">{t.navMeal}</span>
                  <span className="hidden md:inline">{t.navMealLong}</span>
                </a>
              </li>
              <li><button onClick={onOpenAbout} className="hover:underline">{t.navAbout}</button></li>
              {/* Mobil: dil + tema, menünün doğal devamı olarak */}
              <li className="sm:hidden">
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="rounded-md bg-white/10 text-light text-sm font-semibold px-1.5 py-0.5 border-0 focus:outline-none focus:ring-2 focus:ring-white/40 [&>option]:text-ink"
                  title={t.langLabel}
                  aria-label={t.langLabel}
                >
                  {Object.values(locales).map((l) => (
                    <option key={l.code} value={l.code}>{l.code.toUpperCase()}</option>
                  ))}
                </select>
              </li>
              <li className="sm:hidden">
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="rounded-md bg-white/10 px-2 py-0.5"
                  title={theme === "dark" ? t.themeToLight : t.themeToDark}
                  aria-label={theme === "dark" ? t.themeToLight : t.themeToDark}
                >
                  <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"} text-sm`} aria-hidden="true"></i>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}
