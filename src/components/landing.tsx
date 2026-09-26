"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { catalogs, isLocale, localeCookieName, type Locale } from "@/lib/i18n/catalogs";
import { localizeView } from "@/lib/i18n/localize-view";


const changingWords = [
  { text: "Создавай", color: "#f0bd28", effect: "create", mark: "✦" },
  { text: "Программируй", color: "#19b8d1", effect: "code", mark: "</>" },
  { text: "Разрабатывай", color: "#e56a32", effect: "develop", mark: "{ }" },
  { text: "Твори", color: "#a86ad1", effect: "imagine", mark: "✺" },
  { text: "Внедряй", color: "#52a66d", effect: "deploy", mark: "↗" },
  { text: "Запускай", color: "#e65360", effect: "launch", mark: "➜" },
];

const navItems = [
  { id: "home", label: "Главная", href: "#main", section: ".hero" },
  { id: "courses", label: "Курсы", href: "/courses", section: null },
  { id: "login", label: "Войти", href: "/login", section: null },
];
function Brand({ locale }: { locale: Locale }) {
  const messages = catalogs[locale];
  return (
    <a href="#main" className="brand" aria-label={messages["Окурмэн айти — главная"]}>
      <Image src="/logo.png" alt={messages["Окурмэн айти"]} className="brand-icon" width={43} height={43} />
      <span>
        {messages["окурмэн"]}<span className="brand-sub">{messages["айти мектеби"]}</span>
      </span>
    </a>
  );
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

export default function Landing({
  initialLanguage = "ru",
  showChrome = false,
}: {
  initialLanguage?: Locale;
  showChrome?: boolean;
}) {
  const [language, setLanguage] = useState<Locale>(initialLanguage);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });
  const [indicatorMoving, setIndicatorMoving] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const activeNavLinkRef = useRef<HTMLAnchorElement>(null);
  const previousNavRef = useRef(activeNav);
  const languageControlRef = useRef<HTMLDivElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // Каждое слово получает собственную анимацию раз в пять секунд.
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % changingWords.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const visibleSections = new Map<Element, string>();
    const sections = navItems
      .map(({ id, section }) => [id, section ? document.querySelector(section) : null] as const)
      .filter((entry): entry is readonly [string, Element] => entry[1] !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = sections.find(([, element]) => element === entry.target)?.[0];
          if (!id) continue;
          if (entry.isIntersecting) visibleSections.set(entry.target, id);
          else visibleSections.delete(entry.target);
        }
        const nearest = [...visibleSections.entries()].sort(
          ([a], [b]) =>
            Math.abs(a.getBoundingClientRect().top - window.innerHeight * 0.28) -
            Math.abs(b.getBoundingClientRect().top - window.innerHeight * 0.28),
        )[0];
        if (nearest) setActiveNav(nearest[1]);
      },
      { rootMargin: "-24% 0px -62% 0px", threshold: 0 },
    );
    for (const [, section] of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const nav = navRef.current;
    const link = activeNavLinkRef.current;
    if (!nav || !link) return;
    const updateIndicator = () => {
      setIndicator({ left: link.offsetLeft, width: link.offsetWidth, ready: true });
      if (window.innerWidth <= 767) {
        const left = link.offsetLeft;
        const right = left + link.offsetWidth;
        if (left < nav.scrollLeft || right > nav.scrollLeft + nav.clientWidth) {
          nav.scrollTo({
            left: left - nav.clientWidth / 2 + link.offsetWidth / 2,
            behavior: "smooth",
          });
        }
      }
    };
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeNav, language]);
  useEffect(() => {
    if (previousNavRef.current === activeNav) return;
    previousNavRef.current = activeNav;
    setIndicatorMoving(true);
    const timer = window.setTimeout(() => setIndicatorMoving(false), 420);
    return () => window.clearTimeout(timer);
  }, [activeNav]);
  useEffect(() => {
    const sync = () => {
      const cookieLocale = document.cookie
        .split("; ")
        .find((cookie) => cookie.startsWith(`${localeCookieName}=`))
        ?.split("=")[1];
      const queryLocale = new URLSearchParams(window.location.search).get("lang");
      const lang = isLocale(cookieLocale)
        ? cookieLocale
        : isLocale(queryLocale)
          ? queryLocale
          : initialLanguage;
      setLanguage(lang);
      document.documentElement.lang = lang === "kg" ? "ky" : lang;
      document.title = catalogs[lang]["__meta.title"];
      setDark(document.documentElement.dataset.theme === "dark");
    };
    const id = requestAnimationFrame(sync);
    window.addEventListener("popstate", sync);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("popstate", sync);
    };
  }, [initialLanguage]);
  useEffect(() => {
    document.documentElement.lang = language === "kg" ? "ky" : language;
    document.title = catalogs[language]["__meta.title"];
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${localeCookieName}=${language}; path=/; max-age=31536000; samesite=lax${secure}`;
  }, [language]);
  useEffect(() => {
    if (!languageMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!languageControlRef.current?.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLanguageMenuOpen(false);
        languageControlRef.current?.querySelector<HTMLButtonElement>(".language-trigger")?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [languageMenuOpen]);
  useEffect(() => {
    if (!languageMenuOpen) return;
    languageMenuRef.current
      ?.querySelector<HTMLButtonElement>('[aria-checked="true"]')
      ?.focus();
  }, [languageMenuOpen]);
  function changeTheme() {
    const next =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setDark(next === "dark");
    try {
      localStorage.setItem("okurmen-theme", next);
    } catch {
      /* Storage may be unavailable. */
    }
  }
  function changeLanguage(next: string) {
    if (!isLocale(next)) return;
    setLanguage(next);
    const url = new URL(window.location.href);
    if (next === "ru") url.searchParams.delete("lang");
    else url.searchParams.set("lang", next);
    window.history.pushState({}, "", url);
  }
  function handleLanguageMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!languageMenuRef.current || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const options = Array.from(languageMenuRef.current.querySelectorAll<HTMLButtonElement>(".language-option"));
    const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? options.length - 1
        : (currentIndex + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length;
    options[nextIndex]?.focus();
  }
  const content = (
    <>
      <div className="ambient-layer" aria-hidden="true">
        <span className="ambient-code ambient-code--one ambient-drift-a"><b>&lt;main</b> <i>className</i>=<em>&quot;app&quot;</em><b>&gt;</b></span>
        <span className="ambient-code ambient-code--two ambient-drift-b"><b>const</b> app <i>=</i> <em>createRoot</em>();</span>
        <span className="ambient-code ambient-code--three ambient-drift-c"><i>.button:hover</i> &#123; <em>transform</em>: translateY(-2px); &#125;</span>
        <span className="ambient-code ambient-code--four ambient-drift-d"><b>function</b> App() =&gt; &lt;React /&gt;</span>
        <span className="ambient-code ambient-code--five ambient-drift-b"><b>$</b> git push origin main</span>
        <span className="ambient-code ambient-code--six ambient-drift-a"><b>SELECT</b> * <b>FROM</b> courses;</span>
        <span className="ambient-code ambient-code--seven ambient-drift-d"><i>fetch</i>(&quot;/api/courses&quot;)</span>
        <span className="ambient-code ambient-code--eight ambient-drift-c">npm run build <b>✓</b></span>
        <span className="ambient-code ambient-code--nine ambient-drift-c"><b>import</b> &#123; useState &#125; <b>from</b> &quot;react&quot;;</span>
        <span className="ambient-code ambient-code--ten ambient-drift-a"><i>.hero</i> &#123; display: grid; gap: 2rem; &#125;</span>
        <span className="ambient-code ambient-code--eleven ambient-drift-b"><b>export default</b> App;</span>
        <span className="ambient-code ambient-code--twelve ambient-drift-d"><b>await</b> response.<i>json</i>();</span>
        <span className="ambient-code ambient-code--thirteen ambient-drift-a">docker compose up</span>
        <span className="ambient-code ambient-code--fourteen ambient-drift-c"><b>type</b> Props = &#123; children: ReactNode &#125;</span>
        <span className="ambient-code ambient-code--fifteen ambient-drift-d"><b>return</b> &lt;CourseCard &#123;...props&#125; /&gt;;</span>
        <span className="ambient-code ambient-code--sixteen ambient-drift-b">@media (max-width: 768px) &#123; ... &#125;</span>
        <span className="ambient-code ambient-code--seventeen ambient-drift-a"><i>useEffect</i>(() =&gt; &#123; &#125;, []);</span>
        <span className="ambient-code ambient-code--eighteen ambient-drift-c">npm install next</span>
        <span className="ambient-code ambient-code--nineteen ambient-drift-b"><b>if</b> (status === &quot;ready&quot;)</span>
        <span className="ambient-code ambient-code--twenty ambient-drift-d">git status --short</span>
      </div>
      {showChrome && (
        <>
      <a className="skip-link" href="#main">
        К содержимому
      </a>
      <header className="header">
        <div className="header-top">
          <Brand locale={language} />
          <div className="header-actions">
            <div
              className="language-control"
              ref={languageControlRef}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setLanguageMenuOpen(false);
                }
              }}
            >
              <button
                className="language-trigger"
                type="button"
                aria-label="Язык"
                aria-haspopup="menu"
                aria-expanded={languageMenuOpen}
                aria-controls="language-menu"
                onClick={() => setLanguageMenuOpen((open) => !open)}
              >
                {language.toUpperCase()}
              </button>
              {languageMenuOpen && (
                <div
                  className="language-menu"
                  id="language-menu"
                  role="menu"
                  aria-label="Язык"
                  ref={languageMenuRef}
                  onKeyDown={handleLanguageMenuKeyDown}
                >
                  {([
                    ["ru", "RU"],
                    ["kg", "KG"],
                    ["en", "EN"],
                  ] as const).map(([locale, label], index) => (
                    <button
                      className={language === locale ? "language-option is-selected" : "language-option"}
                      type="button"
                      role="menuitemradio"
                      aria-checked={language === locale}
                      key={locale}
                      style={{ "--option-index": index } as React.CSSProperties}
                      onClick={() => {
                        changeLanguage(locale);
                        setLanguageMenuOpen(false);
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
              aria-label={language === "ru" ? "Тёмная тема" : "Караңгы тема"}
            />
            <div className="theme-switch__container">
              <div className="theme-switch__clouds"></div>
              <div className="theme-switch__stars-container">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.11136 36.2995 2.05513 35.8503 2.83131 35.0069C3.6075 34.1635 3.99559 33.1642 3.99559 32C3.99559 33.1642 4.38368 34.1635 5.15987 35.0069C5.93605 35.8503 6.87982 36.2903 8 36.3545C7.26792 36.3911 6.59757 36.602 5.98015 37.0053C5.37155 37.3995 4.88644 37.9312 4.52481 38.5913C4.172 39.2513 3.99559 39.9572 3.99559 40.7273C3.99559 39.563 3.6075 38.5546 2.83131 37.7112C2.05513 36.8587 1.11136 36.4095 0 36.3545ZM56.8313 24.0069C56.0551 24.8503 55.1114 25.2995 54 25.3545C55.1114 25.4095 56.0551 25.8587 56.8313 26.7112C57.6075 27.5546 57.9956 28.563 57.9956 29.7273C57.9956 28.9572 58.172 28.2513 58.5248 27.5913C58.8864 26.9312 59.3716 26.3995 59.9802 26.0053C60.5976 25.602 61.2679 25.3911 62 25.3545C60.8798 25.2903 59.9361 24.8503 59.1599 24.0069C58.3837 23.1635 57.9956 22.1642 57.9956 21C57.9956 22.1642 57.6075 23.1635 56.8313 24.0069ZM81 25.3545C82.1114 25.2995 83.0551 24.8503 83.8313 24.0069C84.6075 23.1635 84.9956 22.1642 84.9956 21C84.9956 22.1642 85.3837 23.1635 86.1599 24.0069C86.9361 24.8503 87.8798 25.2903 89 25.3545C88.2679 25.3911 87.5976 25.602 86.9802 26.0053C86.3716 26.3995 85.8864 26.9312 85.5248 27.5913C85.172 28.2513 84.9956 28.9572 84.9956 29.7273C84.9956 28.563 84.6075 27.5546 83.8313 26.7112C83.0551 25.8587 82.1114 25.4095 81 25.3545ZM136 36.3545C137.111 36.2995 138.055 35.8503 138.831 35.0069C139.607 34.1635 139.996 33.1642 139.996 32C139.996 33.1642 140.384 34.1635 141.16 35.0069C141.936 35.8503 142.88 36.2903 144 36.3545C143.268 36.3911 142.598 36.602 141.98 37.0053C141.372 37.3995 140.886 37.9312 140.525 38.5913C140.172 39.2513 139.996 39.9572 139.996 40.7273C139.996 39.563 139.607 38.5546 138.831 37.7112C138.055 36.8587 137.111 36.4095 136 36.3545ZM101.831 49.0069C101.055 49.8503 100.111 50.2995 99 50.3545C100.111 50.4095 101.055 50.8587 101.831 51.7112C102.607 52.5546 102.996 53.563 102.996 54.7273C102.996 53.9572 103.172 53.2513 103.525 52.5913C103.886 51.9312 104.372 51.3995 104.98 51.0053C105.598 50.602 106.268 50.3911 107 50.3545C105.88 50.2903 104.936 49.8503 104.16 49.0069C103.384 48.1635 102.996 47.1642 102.996 46C102.996 47.1642 102.607 48.1635 101.831 49.0069Z" fill="currentColor"></path>
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
          <Link className="header-login" href="/login">
            Войти
          </Link>
          </div>
        </div>
        <nav ref={navRef} aria-label="Основная навигация" className="nav">
          <span
            aria-hidden="true"
            className={`nav-indicator${indicatorMoving ? " is-moving" : ""}`}
            style={{ left: indicator.left, width: indicator.width, opacity: indicator.ready ? 1 : 0 }}
          />
          {navItems.map(({ id, label, href }) => (
            <a
              aria-current={activeNav === id ? "location" : undefined}
              className={[
                activeNav === id ? "active" : "",
                id === "login" ? "mobile-nav-only" : "",
              ].filter(Boolean).join(" ") || undefined}
              href={href}
              key={id}
              ref={activeNav === id ? activeNavLinkRef : null}
              onClick={() => setActiveNav(id)}
            >
              <span className="nav-icon" aria-hidden="true">
                {id === "home" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
                  </svg>
                ) : id === "courses" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 7v14m0-14C9.5 5.2 6.5 4.7 3 5.5v13c3.5-.8 6.5-.3 9 1.5m0-13c2.5-1.8 5.5-2.3 9-1.5v13c-3.5-.8-6.5-.3-9 1.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                )}
              </span>
              <span className="nav-label">{label}</span>
            </a>
          ))}
        </nav>
      </header>
        </>
      )}
      <main id="main">
        <section className="hero section-wrap">
          <div className="hero-copy">
            <Eyebrow>
              <span className="status-dot" />
              ТВОЯ НОВАЯ ТОЧКА СТАРТА
            </Eyebrow>
            <h1>
              Не просто
              <br />
              изучай IT
              <br />
              <span className="serif-accent">
                <span className="changing-word-stage" aria-live="polite">
                  <span
                    key={currentWordIndex}
                    className={`changing-word changing-word--${changingWords[currentWordIndex].effect}`}
                    style={{ color: changingWords[currentWordIndex].color }}
                  >
                    <span className="changing-word-text">
                      {changingWords[currentWordIndex].text}
                    </span>
                    <span className="changing-word-mark" aria-hidden="true">
                      {changingWords[currentWordIndex].mark}
                    </span>
                    <span className="word-particles" aria-hidden="true">
                      {Array.from({ length: 6 }, (_, index) => (
                        <i key={index} />
                      ))}
                    </span>
                  </span>
                </span>
              </span>
            </h1>
            <p className="hero-description">
              Преврати «мне интересно» в «я это сделал». Учись frontend и
              backend, пиши код и расти в кругу своих.
            </p>
            <div className="hero-buttons">
              <Link href="/courses" className="button">
                Начать свой путь <span>↗</span>
              </Link>
              <Link href="/courses#courses-directions-title" className="text-button">
                Посмотреть программы <span>↓</span>
              </Link>
            </div>
            <div className="hero-note">
              <span className="note-icon">✦</span>Можно с нуля. Главное —
              любопытство.
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="Иллюстрация: код превращается в первый проект"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="art-spark spark-one">✳</span>
            <span className="art-spark spark-two">+</span>
            <div className="floating-tag">
              <span className="tag-dot" />
              из идеи → в реальность
            </div>
            <div className="code-window">
              <div className="window-top">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>my-first-project.tsx</span>
                <span>⌘</span>
              </div>
              <div className="code-body">
                <div className="code-line">
                  <span>01</span>
                  <code>
                    <b>const</b> developer = {"{"}
                  </code>
                </div>
                <div className="code-line">
                  <span>02</span>
                  <code>
                    {" "}
                    name: <em>&apos;Будущий ты&apos;</em>,
                  </code>
                </div>
                <div className="code-line">
                  <span>03</span>
                  <code>
                    {" "}
                    curiosity: <strong>true</strong>,
                  </code>
                </div>
                <div className="code-line">
                  <span>04</span>
                  <code>
                    {" "}
                    skills: [<em>&apos;dream&apos;</em>,{" "}
                    <em>&apos;create&apos;</em>],
                  </code>
                </div>
                <div className="code-line">
                  <span>05</span>
                  <code>
                    {" "}
                    start: () =&gt; <b>today</b>()
                  </code>
                </div>
                <div className="code-line">
                  <span>06</span>
                  <code>{"}"};</code>
                </div>
                <div className="code-line code-comment">
                  <span>07</span>
                  <code>{"// Всё начинается с первой строки"}</code>
                </div>
                <div className="code-line">
                  <span>08</span>
                  <code>
                    developer.<strong>start</strong>();
                    <i className="cursor" />
                  </code>
                </div>
              </div>
              <div className="terminal">
                <span>✓</span> Твоё будущее успешно собрано{" "}
                <span className="terminal-time">just now</span>
              </div>
            </div>
            <div className="project-preview">
              <div className="preview-top">
                <span className="mini-brand">o↗</span>
                <span>
                  LIVE PREVIEW <i />
                </span>
              </div>
              <div className="preview-shapes">
                <span />
                <span />
                <span />
              </div>
              <p>
                Hello, world<span>!</span>
              </p>
              <div className="preview-bottom">
                Мой первый проект <span>↗</span>
              </div>
            </div>
            <div className="success-sticker">
              <span>✓</span>
              <div>
                Первый шаг сделан!
                <small>git commit -m &quot;my future&quot;</small>
              </div>
            </div>
            <span className="art-caption">learn. build. become.</span>
          </div>
        </section>
        <div className="skills-ribbon">
          <div className="skills-track">
            {[0, 1].map((copy) => (
              <div className="skills-group" aria-hidden={copy === 1} key={copy}>
                {[
                  { id: "html", label: "HTML", logo: "html5", color: "E34F26" },
                  { id: "css", label: "CSS", logo: "css", color: "663399" },
                  { id: "javascript", label: "JavaScript", logo: "javascript", color: "B38B00" },
                  { id: "react", label: "React", logo: "react", color: "087EA4" },
                  { id: "node", label: "Node.js", logo: "nodedotjs", color: "5FA04E" },
                  { id: "postgres", label: "PostgreSQL", logo: "postgresql", color: "336791" },
                  { id: "git", label: "Git", logo: "git", color: "F05032" },
                  { id: "github", label: "GitHub", logo: "github", color: "24292F" },
                  { id: "typescript", label: "TypeScript", logo: "typescript", color: "3178C6" },
                  { id: "next", label: "Next.js", logo: "nextdotjs", color: "111111" },
                  { id: "python", label: "Python", logo: "python", color: "3776AB" },
                  { id: "java", label: "Java", logo: "openjdk", color: "F89820" },
                  { id: "csharp", label: "C#", logo: "dotnet", color: "512BD4" },
                  { id: "cpp", label: "C++", logo: "cplusplus", color: "00599C" },
                  { id: "php", label: "PHP", logo: "php", color: "777BB4" },
                  { id: "go", label: "Go", logo: "go", color: "00ADD8" },
                  { id: "rust", label: "Rust", logo: "rust", color: "CE422B" },
                  { id: "docker", label: "Docker", logo: "docker", color: "2496ED" },
                  { id: "kubernetes", label: "Kubernetes", logo: "kubernetes", color: "326CE5" },
                  { id: "aws", label: "AWS", logo: "aws", color: "FF9900" },
                  { id: "soft", label: "Soft skills", logo: null, color: "7652A8" },
                ].map(({ id, label, logo, color }) => (
                  <span className={`ribbon-item ribbon-item--${id}`} key={id}>
                    {logo ? (
                      <img
                        className="ribbon-logo"
                        src={logo === "aws" ? "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg" : `https://cdn.simpleicons.org/${logo}/${color}`}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                      />
                    ) : (
                      <svg className="ribbon-logo ribbon-logo--team" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                        <circle cx="16" cy="10" r="4" />
                        <circle cx="6" cy="13" r="3" />
                        <circle cx="26" cy="13" r="3" />
                        <path d="M8 26v-2a8 8 0 0 1 16 0v2M1 25v-2a5 5 0 0 1 6-4.9M31 25v-2a5 5 0 0 0-6-4.9" />
                      </svg>
                    )}
                    {id !== "aws" && <span>{label}</span>}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
      {showChrome && <footer className="site-footer">
        <div className="site-footer__content">
          <div className="site-footer__brand">
            <Brand locale={language} />
            <h2>Адрес</h2>
            <address>Orozbekova 136<br />Бишкек, Кыргызстан</address>
          </div>
          <nav className="site-footer__column site-footer__explore" aria-label="Быстрые ссылки">
            <h2>Быстрые ссылки</h2>
            <ul>
              <li><Link href="/">Главная</Link></li>
              <li><Link href="/courses">Направления</Link></li>
            </ul>
            <h3>Курсы</h3>
            <ul>
              <li><Link href="/courses/frontend">Frontend</Link></li>
              <li><Link href="/courses/backend">Backend</Link></li>
              <li><Link href="/courses/start">IT-старт</Link></li>
            </ul>
          </nav>
          <div className="site-footer__column">
            <h2>Контакты</h2>
            <h3>WhatsApp</h3>
            <ul className="site-footer__contacts">
              <li><a href="https://wa.me/996221754775" target="_blank" rel="noreferrer">+996 221 754 775</a></li>
              <li><a href="https://wa.me/996509871058" target="_blank" rel="noreferrer">+996 509 871 058</a></li>
              <li><a href="https://wa.me/996504677725" target="_blank" rel="noreferrer">+996 504 677 725</a></li>
              <li><a href="https://wa.me/996997137895" target="_blank" rel="noreferrer">+996 997 137 895</a></li>
            </ul>
          </div>
          <div className="site-footer__column site-footer__socials">
            <h2>Мы в соцсетях</h2>
            <h3>Instagram</h3>
            <ul className="site-footer__social-links">
              <li><a href="https://www.instagram.com/okurmen_it/" target="_blank" rel="noreferrer">@okurmen_it</a></li>
              <li><a href="https://www.instagram.com/okurmen.studio/" target="_blank" rel="noreferrer">@okurmen.studio</a></li>
              <li><a href="https://www.instagram.com/okurmen.jobs/" target="_blank" rel="noreferrer">@okurmen.jobs</a></li>
              <li><a href="https://www.instagram.com/okurmen_kids/" target="_blank" rel="noreferrer">@okurmen_kids</a></li>
              <li><a href="https://www.instagram.com/okurmen_kids_2/" target="_blank" rel="noreferrer">@okurmen_kids_2</a></li>
            </ul>
            <h3>Threads</h3>
            <ul className="site-footer__social-links">
              <li><a href="https://www.threads.com/@okurmen_it" target="_blank" rel="noreferrer">@okurmen_it</a></li>
              <li><a href="https://www.threads.com/@okurmen.jobs" target="_blank" rel="noreferrer">@okurmen.jobs</a></li>
            </ul>
          </div>
        </div>
        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} <span>Окурмэн айти</span></span>
          <span className="back-top-slot">
            <a href="#" className="back-top" aria-label="Наверх">
              <svg className="back-top-icon" viewBox="0 0 384 512" aria-hidden="true">
                <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
              </svg>
              <span className="back-top-label">Наверх</span>
            </a>
          </span>
        </div>
      </footer>}
    </>
  );
  return localizeView(content, catalogs[language]);
}
