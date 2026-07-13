import React from "react";
import { useLocale } from "../i18n/index.js";

export default function Footer() {
  const { t } = useLocale();
  return (
    <footer className="no-print bg-primary text-light py-6 mt-12 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm space-y-2 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <p>
          {new Date().getFullYear()} {t.footerRights} {"|"}{" "}
          <a href="mailto:smkrtlms@gmail.com" className="underline">{t.footerContact}</a>
        </p>
        <p className="text-xs">{t.footerDisclaimer}</p>
        <p className="text-xs">
          <a href={import.meta.env.BASE_URL + 'privacy.html'} className="underline">{t.footerPrivacy}</a>
          {" | "}
          <a href={import.meta.env.BASE_URL + 'terms.html'} className="underline">{t.footerTerms}</a>
          {" | "}
          <a href={import.meta.env.BASE_URL + 'anayasa.html'} className="underline">{t.rulesLink}</a>
          {" | "}
          <a href="https://github.com/feraiz" className="underline" target="_blank" rel="noopener noreferrer" data-repo-link>{t.footerSource}</a>
        </p>
      </div>
    </footer>
  );
}
