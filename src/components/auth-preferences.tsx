"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { isLocale, localeCookieName, type Locale } from "@/lib/i18n/catalogs";

const localeLabels = [
  ["ru", "RU"],
  ["kg", "KG"],
  ["en", "EN"],
] as const;
const themeChangeEvent = "okurmen-theme-change";

function subscribeTheme(callback: () => void) {
  window.addEventListener(themeChangeEvent, callback);
  return () => window.removeEventListener(themeChangeEvent, callback);
}

function getThemeSnapshot() {
  return document.documentElement.dataset.theme === "dark";
}

function getServerThemeSnapshot() {
  return false;
}

export default function AuthPreferences({
  initialLocale,
}: {
  initialLocale: Locale;
}) {
  const router = useRouter();
  const [locale, setLocale] = useState(initialLocale);
  const [menuOpen, setMenuOpen] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const previousLocale = useRef(initialLocale);
  const dark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

  function changeTheme(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.currentTarget.checked;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem("okurmen-theme", next ? "dark" : "light");
    } catch {
      // Storage can be unavailable in restricted browser contexts.
    }
    window.dispatchEvent(new Event(themeChangeEvent));
  }

  function changeLocale(value: string) {
    if (!isLocale(value)) return;
    setLocale(value);
  }

  useEffect(() => {
    if (previousLocale.current === locale) return;
    previousLocale.current = locale;
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; samesite=lax${secure}`;
    document.documentElement.lang = locale === "kg" ? "ky" : locale;
    router.refresh();
  }, [locale, router]);

  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!menuRef.current || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const options = Array.from(menuRef.current.querySelectorAll<HTMLButtonElement>(".language-option"));
    const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? options.length - 1
        : (currentIndex + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length;
    options[nextIndex]?.focus();
  }

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!controlRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        controlRef.current?.querySelector<HTMLButtonElement>(".language-trigger")?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current
      ?.querySelector<HTMLButtonElement>('[aria-checked="true"]')
      ?.focus();
  }, [menuOpen]);

  const labels = {
    ru: { language: "Язык", theme: "Тёмная тема" },
    en: { language: "Language", theme: "Dark theme" },
    kg: { language: "Тил", theme: "Караңгы тема" },
  }[locale];

  return (
    <div className="auth-preferences">
      <div
        className="language-control"
        ref={controlRef}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setMenuOpen(false);
        }}
      >
        <button
          className="language-trigger"
          type="button"
          aria-label={labels.language}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-controls="auth-language-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {locale.toUpperCase()}
        </button>
        {menuOpen && (
          <div
            className="language-menu"
            id="auth-language-menu"
            role="menu"
            aria-label={labels.language}
            ref={menuRef}
            onKeyDown={handleMenuKeyDown}
          >
            {localeLabels.map(([option, label], index) => (
              <button
                className={locale === option ? "language-option is-selected" : "language-option"}
                type="button"
                role="menuitemradio"
                aria-checked={locale === option}
                key={option}
                style={{ "--option-index": index } as React.CSSProperties}
                onClick={() => {
                  changeLocale(option);
                  setMenuOpen(false);
                }}
              >
                <span className="language-option-name">{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <label className="theme-switch">
        <input
          type="checkbox"
          className="theme-switch__checkbox"
          checked={dark}
          onChange={changeTheme}
          aria-label={labels.theme}
        />
        <div className="theme-switch__container">
          <div className="theme-switch__clouds"></div>
          <div className="theme-switch__stars-container">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.1635 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.1114 36.2995 2.0551 35.8503 2.8313 35.0069C3.6075 34.1635 3.9956 33.1642 3.9956 32C3.9956 33.1642 4.3837 34.1635 5.1599 35.0069C5.9361 35.8503 6.8798 36.2903 8 36.3545C7.2679 36.3911 6.5976 36.602 5.9802 37.0053C5.3716 37.3995 4.8864 37.9312 4.5248 38.5913C4.172 39.2513 3.9956 39.9572 3.9956 40.7273C3.9956 39.563 3.6075 38.5546 2.8313 37.7112C2.0551 36.8587 1.1114 36.4095 0 36.3545ZM56.8313 24.0069C56.0551 24.8503 55.1114 25.2995 54 25.3545C55.1114 25.4095 56.0551 25.8587 56.8313 26.7112C57.6075 27.5546 57.9956 28.563 57.9956 29.7273C57.9956 28.9572 58.172 28.2513 58.5248 27.5913C58.8864 26.9312 59.3716 26.3995 59.9802 26.0053C60.5976 25.602 61.2679 25.3911 62 25.3545C60.8798 25.2903 59.9361 24.8503 59.1599 24.0069C58.3837 23.1635 57.9956 22.1642 57.9956 21C57.9956 22.1642 57.6075 22.1635 56.8313 24.0069ZM81 25.3545C82.1114 25.2995 83.0551 24.8503 83.8313 24.0069C84.6075 23.1635 84.9956 22.1642 84.9956 21C84.9956 22.1642 85.3837 23.1635 86.1599 24.0069C86.9361 24.8503 87.8798 25.2903 89 25.3545C88.2679 25.3911 87.5976 25.602 86.9802 26.0053C86.3716 26.3995 85.8864 26.9312 85.5248 27.5913C85.172 28.2513 84.9956 28.9572 84.9956 29.7273C84.9956 28.563 84.6075 27.5546 83.8313 26.7112C83.0551 25.8587 82.1114 25.4095 81 25.3545ZM136 36.3545C137.111 36.2995 138.055 35.8503 138.831 35.0069C139.607 34.1635 139.996 33.1642 139.996 32C139.996 33.1642 140.384 34.1635 141.16 35.0069C141.936 35.8503 142.88 36.2903 144 36.3545C143.268 36.3911 142.598 36.602 141.98 37.0053C141.372 37.3995 140.886 37.9312 140.525 38.5913C140.172 39.2513 139.996 39.9572 139.996 40.7273C139.996 39.563 139.607 38.5546 138.831 37.7112C138.055 36.8587 137.111 36.4095 136 36.3545ZM101.831 49.0069C101.055 49.8503 100.111 50.2995 99 50.3545C100.111 50.4095 101.055 50.8587 101.831 51.7112C102.607 52.5546 102.996 53.563 102.996 54.7273C102.996 53.9572 103.172 53.2513 103.525 52.5913C103.886 51.9312 104.372 51.3995 104.98 51.0053C105.598 50.602 106.268 50.3911 107 50.3545C105.88 50.2903 104.936 49.8503 104.16 49.0069C103.384 48.1635 102.996 47.1642 102.996 46C102.996 47.1642 102.607 47.1642 101.831 49.0069Z" fill="currentColor" />
            </svg>
          </div>
          <div className="theme-switch__circle-container">
            <div className="theme-switch__sun-moon-container">
              <div className="theme-switch__moon">
                <div className="theme-switch__spot"></div>
                <div className="theme-switch__spot"></div>
                <div className="theme-switch__spot"></div>
              </div>
            </div>
          </div>
        </div>
      </label>
    </div>
  );
}