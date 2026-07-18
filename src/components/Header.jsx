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
              {/* Mobilde linkler de simgelerle aynı çerçeveli buton görünümünde */}
              <li>
                <a
                  href={import.meta.env.BASE_URL + 'meal/'}
                  className="hover:underline text-light rounded-md bg-white/10 px-2 py-1 sm:bg-transparent sm:px-0 sm:py-0"
                >
                  {t.navVerses}
                </a>
              </li>
              <li>
                <a
                  href="https://ayet.cc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-light rounded-md bg-white/10 px-2 py-1 sm:bg-transparent sm:px-0 sm:py-0"
                >
                  <span className="md:hidden">{t.navMeal}</span>
                  <span className="hidden md:inline">{t.navMealLong}</span>
                </a>
              </li>
              {/* Hakkında: geniş ekranda metin, mobilde bilgi simgesi */}
              <li>
                <button onClick={onOpenAbout} className="hover:underline" aria-label={t.navAbout} title={t.navAbout}>
                  <span className="hidden sm:inline">{t.navAbout}</span>
                  <i className="fa-solid fa-circle-info text-base sm:hidden rounded-md bg-white/10 px-2 py-1" aria-hidden="true"></i>
                </button>
              </li>
              {/* Mobil: dil = küre simgesi (üzerinde görünmez select, dokununca telefonun listesi açılır) */}
              <li className="sm:hidden relative">
                <span className="inline-block rounded-md bg-white/10 px-2 py-1" aria-hidden="true">
                  <i className="fa-solid fa-globe text-base"></i>
                </span>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 [&>option]:text-ink [&>option]:bg-white"
                  title={t.langLabel}
                  aria-label={t.langLabel}
                >
                  {Object.values(locales).map((l) => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </li>
              {/* Mobil: tema */}
              <li className="sm:hidden">
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="rounded-md bg-white/10 px-2 py-1"
                  title={theme === "dark" ? t.themeToLight : t.themeToDark}
                  aria-label={theme === "dark" ? t.themeToLight : t.themeToDark}
                >
                  <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"} text-base`} aria-hidden="true"></i>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}
