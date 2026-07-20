import React from "react";
import { locales, useLocale } from "../i18n/index.js";

export default function Header({ onOpenAbout, theme, onToggleTheme }) {
  const { t, lang, setLang } = useLocale();

  const langSelect = (className) => (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      className={className}
      title={t.langLabel}
      aria-label={t.langLabel}
    >
      {Object.values(locales).map((l) => (
        <option key={l.code} value={l.code}>{l.name}</option>
      ))}
    </select>
  );

  const themeButton = (className) => (
    <button
      type="button"
      onClick={onToggleTheme}
      className={className}
      title={theme === "dark" ? t.themeToLight : t.themeToDark}
      aria-label={theme === "dark" ? t.themeToLight : t.themeToDark}
    >
      <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"} leading-none`} aria-hidden="true"></i>
    </button>
  );

  return (
    <header className="no-print sticky top-0 z-10 bg-primary text-light shadow-md w-full pt-[env(safe-area-inset-top)]">
      {/* Masaüstü: tek satır — solda logo+başlık, ortada nav, sağda dil+tema */}
      <div className="hidden sm:grid grid-cols-[auto_1fr_auto] items-center gap-4 max-w-6xl mx-auto px-4 py-3 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <div className="flex items-center gap-2 min-w-0">
          <i className="fas fa-balance-scale text-lg shrink-0" aria-hidden="true"></i>
          <span className="text-lg font-extrabold tracking-wide whitespace-nowrap">Feraiz.com</span>
          <span className="hidden lg:inline opacity-80 text-sm whitespace-nowrap">| {t.tagline.replace(/^[^:]+:\s*/, '')}</span>
        </div>

        <nav className="flex justify-center">
          <ul className="flex items-center gap-5 text-sm whitespace-nowrap">
            <li>
              <a href={import.meta.env.BASE_URL + 'meal/'} className="hover:underline text-light">
                {t.navVerses}
              </a>
            </li>
            <li>
              <a href="https://ayet.cc/" target="_blank" rel="noopener noreferrer" className="hover:underline text-light">
                <span className="md:hidden">{t.navMeal}</span>
                <span className="hidden md:inline">{t.navMealLong}</span>
              </a>
            </li>
            <li>
              <button onClick={onOpenAbout} className="hover:underline" aria-label={t.navAbout} title={t.navAbout}>
                {t.navAbout}
              </button>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2 justify-self-end shrink-0">
          {langSelect("h-8 rounded-full bg-white/10 hover:bg-white/20 text-light text-sm px-2 border-0 focus:outline-none focus:ring-2 focus:ring-white/40 [&>option]:text-ink")}
          {themeButton("w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center")}
        </div>
      </div>

      {/* Mobil: kompakt dikey düzen */}
      <div className="sm:hidden max-w-6xl mx-auto px-4 py-2.5 text-center pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <div className="flex items-center justify-center gap-2">
          <i className="fas fa-balance-scale text-lg" aria-hidden="true"></i>
          <h1 className="text-xl font-extrabold tracking-wide">Feraiz.com</h1>
        </div>
        <p className="opacity-90 text-xs mt-0.5">{t.tagline}</p>
        <nav className="mt-2">
          <ul className="flex items-center gap-1.5 text-sm flex-wrap justify-center w-full">
            {/* Tüm öğeler aynı yükseklikte (h-7) ortalanmış hap */}
            <li>
              <a
                href={import.meta.env.BASE_URL + 'meal/'}
                className="inline-flex items-center h-7 px-2 rounded-md bg-white/10 hover:underline text-light"
              >
                {t.navVerses}
              </a>
            </li>
            <li>
              <a
                href="https://ayet.cc/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center h-7 px-2 rounded-md bg-white/10 hover:underline text-light"
              >
                {t.navMeal}
              </a>
            </li>
            <li>
              <button
                onClick={onOpenAbout}
                className="inline-flex items-center h-7 px-2 rounded-md bg-white/10"
                aria-label={t.navAbout}
                title={t.navAbout}
              >
                <i className="fa-solid fa-circle-info leading-none" aria-hidden="true"></i>
              </button>
            </li>
            {/* Dil = küre simgesi (üzerinde görünmez select, dokununca telefonun listesi açılır) */}
            <li className="relative">
              <span className="inline-flex items-center h-7 px-2 rounded-md bg-white/10" aria-hidden="true">
                <i className="fa-solid fa-globe leading-none"></i>
              </span>
              {langSelect("absolute inset-0 w-full h-full opacity-0 [&>option]:text-ink [&>option]:bg-white")}
            </li>
            <li>
              {themeButton("inline-flex items-center h-7 px-2 rounded-md bg-white/10")}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
