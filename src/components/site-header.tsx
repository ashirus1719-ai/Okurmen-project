"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { catalogs, type Locale } from "@/lib/i18n/catalogs";
import AuthPreferences from "@/components/auth-preferences";
import SiteBrand from "@/components/site-brand";

const navItems = [
  { id: "home", label: "Главная", href: "/#main" },
  { id: "courses", label: "Курсы", href: "/courses" },
  { id: "login", label: "Войти", href: "/login" },
] as const;

type NavId = (typeof navItems)[number]["id"];

function NavIcon({ id }: { id: NavId }) {
  if (id === "home") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
      </svg>
    );
  }

  if (id === "courses") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 7v14m0-14C9.5 5.2 6.5 4.7 3 5.5v13c3.5-.8 6.5-.3 9 1.5m0-13c2.5-1.8 5.5-2.3 9-1.5v13c-3.5-.8-6.5-.3-9 1.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  );
}

export default function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const activeNav: NavId | null = pathname === "/"
    ? "home"
    : pathname.startsWith("/courses")
      ? "courses"
      : null;
  const messages = catalogs[locale];
  const navRef = useRef<HTMLElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    const nav = navRef.current;
    const link = activeLinkRef.current;
    if (!nav || !link) return;

    const updateIndicator = () => {
      setIndicator({ left: link.offsetLeft, width: link.offsetWidth, ready: true });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeNav, locale]);

  return (
    <>
      <a className="skip-link" href="#main">{messages["К содержимому"]}</a>
      <header className="header" id="top">
        <div className="header-top">
          <SiteBrand locale={locale} />
          <div className="header-actions">
            <AuthPreferences initialLocale={locale} />
            <Link className="header-login" href="/login">{messages["Войти"]}</Link>
          </div>
        </div>
        <nav ref={navRef} aria-label={messages["Основная навигация"]} className="nav">
          <span
            aria-hidden="true"
            className="nav-indicator"
            style={{ left: indicator.left, width: indicator.width, opacity: indicator.ready ? 1 : 0 }}
          />
          {navItems.map(({ id, label, href }) => (
            <Link
              aria-current={activeNav === id ? "page" : undefined}
              className={[
                activeNav === id ? "active" : "",
                id === "login" ? "mobile-nav-only" : "",
              ].filter(Boolean).join(" ") || undefined}
              href={href}
              key={id}
              ref={activeNav === id ? activeLinkRef : null}
            >
              <span className="nav-icon" aria-hidden="true"><NavIcon id={id} /></span>
              <span className="nav-label">{messages[label]}</span>
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}