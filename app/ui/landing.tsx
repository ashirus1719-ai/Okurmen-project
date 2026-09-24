"use client";

import { useActionState, useEffect, useState } from "react";
import { submitLead } from "../actions";
import { kyrgyzView } from "./kyrgyz";
import Link from "next/link";

import { courses } from "@/lib/courses";

const changingWords = [
  { text: "Создавай", color: "#f0bd28", effect: "create", mark: "✦" },
  { text: "Программируй", color: "#19b8d1", effect: "code", mark: "</>" },
  { text: "Разрабатывай", color: "#e56a32", effect: "develop", mark: "{ }" },
  { text: "Твори", color: "#a86ad1", effect: "imagine", mark: "✺" },
  { text: "Внедряй", color: "#52a66d", effect: "deploy", mark: "↗" },
  { text: "Запускай", color: "#e65360", effect: "launch", mark: "➜" },
];

const faqs = [
  [
    "Я никогда не писал код. У меня получится?",
    "Начать можно без опыта. На консультации обсудим твой уровень и подберём программу. Прогресс зависит от регулярной практики: ошибки и вопросы — нормальная часть обучения.",
  ],
  [
    "Сколько стоит обучение?",
    "Стоимость зависит от направления, группы и тарифа. До записи сообщим полную сумму, включённые услуги и правила возврата. Актуальные цены и условия рассрочки пока уточняются.",
  ],
  [
    "Нужен ли свой ноутбук?",
    "Для самостоятельной практики нужен компьютер с браузером и редактором кода. Требования к устройству и наличие техники в аудитории уточним для выбранного курса до записи.",
  ],
  [
    "Можно ли совмещать с работой или учёбой?",
    "Расскажи о свободном времени на консультации. Обсудим доступные группы, нагрузку и формат. Условия пропусков, переносов и доступа к записям зависят от группы.",
  ],
  [
    "Есть ли ограничения по возрасту?",
    "Возрастные условия уточняются для каждой программы. Для несовершеннолетнего оформление проходит с участием законного представителя.",
  ],
  [
    "Вы гарантируете трудоустройство?",
    "Нет, мы не обещаем гарантированную работу. Обучение помогает развивать навыки и создавать проекты. Трудоустройство зависит от подготовки, практики и требований работодателей.",
  ],
];
function Brand() {
  return (
    <a href="#main" className="brand" aria-label="Окурмен айти — главная">
      <img src="/okurman-it.jpg" alt="Окурмен айти" className="brand-icon" />
      <span>
        окурмен<span className="brand-sub">айти мектеби</span>
      </span>
    </a>
  );
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

export default function Landing({
  initialLanguage = "ru",
  initialFilter = "all",
  initialCourse = "undecided",
}: {
  initialLanguage?: string;
  initialFilter?: string;
  initialCourse?: string;
}) {
  const [language, setLanguage] = useState(initialLanguage);
  const [dark, setDark] = useState(false);
  const [menu, setMenu] = useState(false);
  const [filter, setFilter] = useState(initialFilter);
  const [answer, setAnswer] = useState<string | null>(null);
  const [review, setReview] = useState("students");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [state, formAction, pending] = useActionState(submitLead, {
    status: "idle",
    message: "",
  });

  // Каждое слово получает собственную анимацию раз в пять секунд.
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % changingWords.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const sync = () => {
      const selected = new URLSearchParams(window.location.search).get(
        "direction",
      );
      setFilter(selected === "code" || selected === "start" ? selected : "all");
      const lang =
        new URLSearchParams(window.location.search).get("lang") === "ky"
          ? "ky"
          : "ru";
      setLanguage(lang);
      document.documentElement.lang = lang;
      setDark(document.documentElement.dataset.theme === "dark");
    };
    const id = requestAnimationFrame(sync);
    window.addEventListener("popstate", sync);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("popstate", sync);
    };
  }, []);
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
  function chooseFilter(id: string) {
    setFilter(id);
    const url = new URL(window.location.href);
    if (id === "all") url.searchParams.delete("direction");
    else url.searchParams.set("direction", id);
    window.history.pushState({}, "", url);
  }
  function changeLanguage() {
    const next = language === "ru" ? "ky" : "ru";
    setLanguage(next);
    document.documentElement.lang = next;
    const url = new URL(window.location.href);
    if (next === "ru") url.searchParams.delete("lang");
    else url.searchParams.set("lang", "ky");
    window.history.pushState({}, "", url);
  }
  const content = (
    <>
      <a className="skip-link" href="#main">
        К содержимому
      </a>
      <header className="header">
        <Brand />
        <nav
          aria-label="Основная навигация"
          className={menu ? "nav open" : "nav"}
        >
          {[
            ["courses", "Курсы"],
            ["approach", "Как учим"],
            ["community", "Сообщество"],
            ["faq", "FAQ"],
          ].map(([id, label]) => (
            <a href={`#${id}`} key={id} onClick={() => setMenu(false)}>
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="language"
            aria-label={language === "ru" ? "Кыргызча" : "Русский"}
            onClick={changeLanguage}
          >
            {language.toUpperCase()} ⌄
          </button>
          <button
            className="theme-switch"
            role="switch"
            aria-checked={dark}
            aria-label={language === "ru" ? "Тёмная тема" : "Караңгы тема"}
            onClick={changeTheme}
          >
            <span className="theme-orb" />
            <span className="theme-cloud">☁</span>
            <span className="theme-stars">· ✧</span>
          </button>
          <a className="button button-small desktop-cta" href="#courses">
            Выбрать курс <span>↗</span>
          </a>
          <button
            className="menu-button"
            aria-label="Меню"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? "✕" : "☰"}
          </button>
        </div>
      </header>
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
              <a href="#consultation" className="button">
                Начать свой путь <span>↗</span>
              </a>
              <a href="#courses" className="text-button">
                Посмотреть программы <span>↓</span>
              </a>
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
          <div>
            {[
              "HTML & CSS",
              "JavaScript",
              "React",
              "Node.js",
              "PostgreSQL",
              "Git & GitHub",
              "Soft skills",
            ].map((s, i) => (
              <span className="ribbon-item" key={s}>
                {i > 0 && <i aria-hidden="true">✳</i>}
                {s}
              </span>
            ))}
          </div>
        </div>
        <section id="courses" className="section-wrap section-space">
          <div className="section-heading">
            <div>
              <Eyebrow>01 / НАЙДИ СВОЁ НАПРАВЛЕНИЕ</Eyebrow>
              <h2>
                Большой путь.
                <br />
                <span className="muted">Твой первый курс.</span>
              </h2>
            </div>
            <p>
              Для тех, кто только знакомится с кодом, и тех, кто готов идти
              дальше. Выбери, что зажигает именно тебя.
            </p>
          </div>
          <div className="filter-row" aria-label="Фильтр направлений">
            {[
              ["all", "Все направления"],
              ["code", "Разработка"],
              ["start", "Для начинающих"],
            ].map(([id, name]) => (
              <button
                key={id}
                aria-pressed={filter === id}
                className={filter === id ? "filter active" : "filter"}
                onClick={() => chooseFilter(id)}
              >
                {name}
              </button>
            ))}
            <span className="filter-hint">Сначала интерес. Потом — код.</span>
          </div>
          <div className="course-grid">
            {courses
              .filter((c) => filter === "all" || c.type === filter)
              .map((c, index) => (
                <article className={`course-card ${c.color}`} key={c.id}>
                  <div className="course-card-top">
                    <span className="pill">С нуля</span>
                    <span className="course-number">0{index + 1}</span>
                  </div>
                  <div className="course-symbol" aria-hidden="true">
                    {c.symbol}
                  </div>
                <h3><Link href={`/courses/${c.id}`}>{c.title} <span className="course-title-arrow">↗</span></Link></h3>
                  <h4>{c.subtitle}</h4>
                  <p>{c.description}</p>
                  <div className="course-tags">
                    {c.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <details className="course-details">
                    <summary>
                      Программа курса <span>+</span>
                    </summary>
                    <ol>
                      {c.modules.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ol>
                    <a href="#consultation" className="text-button">
                      Обсудить обучение ↗
                    </a>
                  </details>
                </article>
              ))}
          </div>
          <div className="help-strip">
            <span className="help-symbol">↳</span>
            <p>
              Не знаешь, что выбрать? Это нормально.
              <span> Разберёмся вместе на консультации.</span>
            </p>
            <a href="#consultation">Помогите определиться ↗</a>
          </div>
        </section>
        <section id="approach" className="approach-section">
          <div className="section-wrap section-space">
            <div className="section-heading">
              <div>
                <Eyebrow>02 / МЕНЬШЕ СЛОВ. БОЛЬШЕ КОДА.</Eyebrow>
                <h2>
                  Не остаёшься один
                  <br />
                  на один с ошибкой.
                </h2>
              </div>
              <p>
                Учиться новому бывает непросто. Поэтому рядом — понятный
                маршрут, практика и человек, которому можно задать вопрос.
              </p>
            </div>
            <div className="approach-grid">
              <div className="mentoring-art" aria-hidden="true">
                <div className="chat-bubble">
                  А почему код не работает? <span>↙</span>
                </div>
                <div className="chat-bubble reply">
                  Давай разберёмся вместе <span>✦</span>
                </div>
                <div className="mini-editor">
                  <span>● ● ●</span>
                  <code>
                    <i>if</i> (stuck) {"{"}
                    <br /> askMentor();
                    <br /> tryAgain();
                    <br />
                    {"}"}
                  </code>
                  <small>✓ You&apos;ve got this.</small>
                </div>
                <div className="mentor-star">✳</div>
              </div>
              <div>
                {[
                  [
                    "01",
                    "Понимать, а не заучивать",
                    "Разбираем логику на понятных примерах. Ты знаешь не только как, но и почему это работает.",
                  ],
                  [
                    "02",
                    "Пробовать с первого занятия",
                    "Короткая теория, задачи и свой код. Каждая тема становится частью будущего проекта.",
                  ],
                  [
                    "03",
                    "Расти через обратную связь",
                    "Разбор решений с ментором помогает увидеть ошибки, улучшить код и сделать следующий шаг.",
                  ],
                ].map(([n, title, desc]) => (
                  <div className="benefit" key={n}>
                    <span>{n}</span>
                    <div>
                      <h3>{title}</h3>
                      <p>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="learning-path">
              {[
                "Знакомимся",
                "Выбираем группу",
                "Учимся и практикуем",
                "Разбираем решения",
                "Защищаем проект",
              ].map((step, i) => (
                <div key={step}>
                  <span>0{i + 1}</span>
                  <p>{step}</p>
                  <i>↗</i>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="formats" className="section-wrap section-space">
          <div className="section-heading">
            <div>
              <Eyebrow>03 / В ТВОЁМ РИТМЕ</Eyebrow>
              <h2>
                Учёба вписывается
                <br />
                <span className="muted">в твою жизнь.</span>
              </h2>
            </div>
            <a href="#consultation" className="text-button">
              Подобрать формат ↗
            </a>
          </div>
          <div className="formats-grid">
            {[
              [
                "◎",
                "Офлайн",
                "В одной аудитории. На одной волне.",
                "Живые занятия, работа в группе и вопросы ментору прямо на месте.",
              ],
              [
                "⇄",
                "Гибрид",
                "Личные встречи + гибкость.",
                "Сочетай занятия в центре с самостоятельной практикой по программе группы.",
              ],
              [
                "⌘",
                "Самостоятельно",
                "Твой темп. Твой фокус.",
                "Учебные материалы и задания — в рамках выбранного тарифа. Условия поддержки уточняются до записи.",
              ],
            ].map(([icon, title, sub, desc]) => (
              <article className="format-card" key={title}>
                <span className="format-icon">{icon}</span>
                <h3>{title}</h3>
                <h4>{sub}</h4>
                <p>{desc}</p>
              </article>
            ))}
          </div>
          <div className="enrollment-banner">
            <div>
              <Eyebrow>
                <span className="status-dot" />
                БЛИЖАЙШИЙ НАБОР
              </Eyebrow>
              <h3>Твой старт начинается со знакомства</h3>
              <p>
                Оставь заявку — уточним даты, расписание, стоимость и доступные
                места. Заявка не обязывает к оплате и не резервирует место.
              </p>
            </div>
            <a href="#consultation" className="button">
              Узнать о наборе <span>↗</span>
            </a>
          </div>
        </section>
        <section id="playground" className="playground-section">
          <div className="section-wrap playground-grid">
            <div>
              <Eyebrow>04 / ПОПРОБУЙ ПРЯМО СЕЙЧАС</Eyebrow>
              <h2>
                Первая строчка.
                <br />
                <span className="serif-accent">Первое «получилось!»</span>
              </h2>
              <p>
                Для первого шага не нужна регистрация. Только немного
                любопытства: что покажет этот код?
              </p>
              <span className="playground-caption">
                {"// small steps, real progress"}
              </span>
            </div>
            <div className="quiz-card">
              <div className="quiz-top">
                <span>JAVASCRIPT · LEVEL 01</span>
                <span>01 / 01</span>
              </div>
              <pre>
                <span>const</span> dream = <em>&quot;Hello&quot;</em>;{"\n"}
                console.log(dream + <em>&quot;, world!&quot;</em>);
              </pre>
              <p>Выбери результат в консоли</p>
              <div className="quiz-options">
                {["Hello, world!", "dream, world!", "Error"].map(
                  (option, i) => (
                    <button
                      className={
                        answer === option
                          ? i === 0
                            ? "correct"
                            : "incorrect"
                          : ""
                      }
                      aria-pressed={answer === option}
                      key={option}
                      onClick={() => setAnswer(option)}
                    >
                      <span>0{i + 1}</span>
                      {option}
                      <span>
                        {answer === option ? (i === 0 ? "✓" : "×") : "○"}
                      </span>
                    </button>
                  ),
                )}
              </div>
              <div className="quiz-feedback" aria-live="polite">
                {answer
                  ? answer === "Hello, world!"
                    ? "✓ Получилось! Оператор + соединяет две строки."
                    : "Попробуй ещё: dream хранит строку «Hello»."
                  : "Ничего страшного, если ошибёшься. Так и учатся."}
              </div>
            </div>
          </div>
        </section>
        <section id="community" className="section-wrap section-space">
          <div className="section-heading">
            <div>
              <Eyebrow>05 / БОЛЬШЕ, ЧЕМ КОД</Eyebrow>
              <h2>
                Окружение,
                <br />
                <span className="muted">в котором растут.</span>
              </h2>
            </div>
            <p>
              Идеи становятся сильнее, когда ими делятся. Учимся говорить,
              работать вместе и видеть чуть шире.
            </p>
          </div>
          <div className="community-grid">
            <div className="community-poster">
              <span>окурмен / together</span>
              <div className="poster-letters" aria-hidden="true">
                <span>о</span>
                <span>к</span>
                <span>у</span>
                <span>р</span>
              </div>
              <h3>
                Свои люди.
                <br />
                Общие открытия.
              </h3>
              <p>Здесь можно задавать вопросы, пробовать и быть собой.</p>
            </div>
            <div className="event-list">
              {[
                [
                  "01",
                  "Оратор курс",
                  "Говори уверенно. Доносить идеи — тоже навык.",
                ],
                [
                  "02",
                  "Өнүгүү сабактар",
                  "Новые привычки, цели и личное развитие.",
                ],
                [
                  "03",
                  "Гапыр агай семинары",
                  "Встречи, которые дают пищу для размышлений.",
                ],
                [
                  "04",
                  "Talking Club",
                  "Разговорная практика в дружелюбном кругу.",
                ],
              ].map(([n, title, desc]) => (
                <a href="#consultation" className="event" key={n}>
                  <span>{n}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                    <small>Даты уточняются</small>
                  </div>
                  <span>↗</span>
                </a>
              ))}
            </div>
          </div>
          <div className="community-notes">
            <div>
              <Eyebrow>КОМАНДА И ПРОСТРАНСТВО</Eyebrow>
              <h3>Сначала познакомимся</h3>
              <p>
                На консультации расскажем о менторе выбранной группы, месте
                занятий и оборудовании. Профили команды и фотографии аудиторий
                появятся после подтверждения.
              </p>
            </div>
            <div id="reviews">
              <div className="review-tabs">
                <button
                  aria-pressed={review === "students"}
                  onClick={() => setReview("students")}
                >
                  Студенты и выпускники
                </button>
                <button
                  aria-pressed={review === "parents"}
                  onClick={() => setReview("parents")}
                >
                  Родители
                </button>
              </div>
              <h3>
                {review === "students"
                  ? "У каждого будет своя история"
                  : "Доверие начинается с открытости"}
              </h3>
              <p>
                {review === "students"
                  ? "Готовим раздел с проектами и историями выпускников. Публикуем только реальные работы и подтверждённые отзывы с согласия авторов."
                  : "Отзывы родителей появятся после согласования публикации. А пока ответим на вопросы о программе и организации занятий на консультации."}
              </p>
            </div>
          </div>
        </section>
        <section id="faq" className="faq-section section-wrap section-space">
          <div>
            <Eyebrow>06 / ДАВАЙ РАЗБЕРЁМСЯ</Eyebrow>
            <h2>
              Хороший вопрос —<br />
              <span className="serif-accent">уже начало.</span>
            </h2>
            <p>Осталось что-то непонятное? Обсудим лично.</p>
            <a href="#consultation" className="text-button">
              Задать свой вопрос ↗
            </a>
          </div>
          <div className="faq-list">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span>+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section id="consultation" className="consultation-section">
          <div className="section-wrap consultation-grid">
            <div>
              <Eyebrow>07 / ТЕПЕРЬ ТВОЯ ОЧЕРЕДЬ</Eyebrow>
              <h2>
                Большие перемены
                <br />
                начинаются
                <br />
                <span className="serif-accent">с простого «привет».</span>
              </h2>
              <p>
                Познакомимся, обсудим твои цели и поможем выбрать направление.
                Без сложных тестов и обязательств.
              </p>
              <span className="consultation-star" aria-hidden="true">
                ✳
              </span>
            </div>
            <form action={formAction} className="lead-form">
              <h3>Давай познакомимся</h3>
              <p>Оставь контакт — свяжемся с тобой</p>
              <div className="honeypot" aria-hidden="true">
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <label>
                Как тебя зовут?
                <input
                  name="name"
                  placeholder="Твоё имя"
                  autoComplete="given-name"
                  minLength={2}
                  maxLength={80}
                  required
                />
              </label>
              <label>
                Телефон или email
                <input
                  name="contact"
                  placeholder="+996 ___ ___ ___ / email"
                  maxLength={120}
                  required
                />
              </label>
              <div className="form-columns">
                <label>
                  Что интересно?
                  <select name="direction" defaultValue={courses.some(course => course.id === initialCourse) ? initialCourse : "undecided"}>
                    <option value="undecided">Пока выбираю</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                    <option value="community">Клубы и события</option>
                  </select>
                </label>
                <label>
                  Формат
                  <select name="format">
                    <option value="undecided">Обсудим вместе</option>
                    <option value="offline">Офлайн</option>
                    <option value="hybrid">Гибрид</option>
                    <option value="self">Самостоятельно</option>
                  </select>
                </label>
              </div>
              <label className="consent">
                <input type="checkbox" name="consent" required />
                <span>
                  Согласен на обработку имени и контакта для ответа на заявку.
                  Заявка не оформляет покупку и не подписывает на рекламу.
                </span>
              </label>
              <button
                className="button"
                disabled={pending || state.status === "success"}
              >
                {pending
                  ? "Отправляем…"
                  : state.status === "success"
                    ? "Заявка принята ✓"
                    : "Записаться на консультацию"}
                {!pending && state.status !== "success" && <span>↗</span>}
              </button>
              <div aria-live="polite" className={`form-status ${state.status}`}>
                {state.message}
              </div>
            </form>
          </div>
        </section>
      </main>
      <footer id="contacts" className="section-wrap">
        <div className="footer-top">
          <Brand />
          <p>Учись. Создавай. Становись собой.</p>
          <a href="#main" className="back-top" aria-label="Наверх">
            ↑
          </a>
        </div>
        <div className="footer-links">
          <a href="#courses">Направления</a>
          <a href="#formats">Форматы обучения</a>
          <a href="#community">Команда и сообщество</a>
          <a href="#reviews">Отзывы</a>
          <a href="#consultation">Связаться с нами</a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Окурмен айти</span>
          <span>
            Адрес, часы работы и прямые контакты готовятся к публикации.
          </span>
          <span>Made for your next step ↗</span>
        </div>
      </footer>
    </>
  );
  return language === "ky" ? kyrgyzView(content) : content;
}
