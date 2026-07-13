import React from "react";

export default function Header({ onOpenAbout }) {
  return (
    <header className="sticky top-0 z-10 bg-primary text-light shadow-md w-full pt-[env(safe-area-inset-top)]">
      <div className="max-w-6xl mx-auto px-4 py-5 text-center pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <div className="flex items-center justify-center gap-3">
          <i className="fas fa-balance-scale text-xl" aria-hidden="true"></i>
          <h1 className="text-3xl font-extrabold tracking-wide">Feraiz.com</h1>
        </div>
        <p className="opacity-90 mt-1">Feraiz: Kur'an'da belirlenmiş miras payları</p>
        <nav className="mt-3">
          <div className="px-4">
            <ul className="flex gap-4 text-sm flex-wrap justify-center w-full">
              <li><a href={import.meta.env.BASE_URL + 'meal/'} className="hover:underline text-light">Ayet Panosu</a></li>
              <li>
                <a
                  href="https://www.suleymaniyevakfimeali.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-light"
                >
                  <span className="md:hidden">SV Kur’an Meali</span>
                  <span className="hidden md:inline">Süleymaniye Vakfı Kur’an-ı Kerim Meali</span>
                </a>
              </li>
              <li><button onClick={onOpenAbout} className="hover:underline">Hakkında</button></li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}
