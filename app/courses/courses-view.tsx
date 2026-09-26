"use client";

import { useState } from "react";
import Link from "next/link";
import { courses } from "@/lib/courses";
import AuthPreferences from "../ui/auth-preferences";
import { type Locale, type MessageCatalog } from "../i18n/catalogs";

type Direction = "frontend" | "backend";

export default function CoursesView({ initialLocale, messages }: { initialLocale: Locale; messages: MessageCatalog }) {
  const [direction, setDirection] = useState<Direction>("frontend");
  const t = (key: string) => messages[key] ?? key;
  const selected = courses.find((course) => course.id === direction)!;
  const starter = courses.find((course) => course.id === "start")!;

  return (
    <main className="courses-experience">
      <div className="courses-ambient" aria-hidden="true"><span /><span /><span /><span /><span /><span /></div>
      <div className="courses-shell">
        <header className="courses-header">
          <Link className="courses-brand" href="/" aria-label={t("courses.homeAria")}>okurmen<span> / IT</span></Link>
          <div className="courses-header-actions">
            <Link className="courses-home" href="/">{t("courses.home")} <span aria-hidden="true">↗</span></Link>
            <AuthPreferences initialLocale={initialLocale} />
          </div>
        </header>

        <section className="courses-hero" aria-labelledby="courses-title">
          <p className="courses-kicker"><span className="courses-spark" aria-hidden="true">✦</span>{t("courses.kicker")}</p>
          <h1 id="courses-title">{t("courses.heading")} <span>{t("courses.headingAccent")}</span></h1>
          <p className="courses-intro">{t("courses.intro")}</p>
        </section>

        <section className="courses-catalog" aria-labelledby="courses-directions-title">
          <div className="courses-section-heading">
            <div><span className="courses-index">01 / 02</span><h2 id="courses-directions-title">{t("courses.chooseDirection")}</h2></div>
            <p>{t("courses.directionHint")}</p>
          </div>
          <div className="courses-direction-list" role="group" aria-label={t("courses.directionAria")}>
            {(["frontend", "backend"] as const).map((id, index) => {
              const course = courses.find((item) => item.id === id)!;
              return <button type="button" key={id} className={`courses-direction ${direction === id ? "is-selected" : ""}`} aria-pressed={direction === id} onClick={() => setDirection(id)}>
                <span className="courses-direction-number">0{index + 1}</span>
                <span className="courses-direction-symbol" aria-hidden="true">{course.symbol}</span>
                <span className="courses-direction-copy"><strong>{t(course.title)}</strong><small>{t(course.subtitle)}</small></span>
                <span className="courses-direction-arrow" aria-hidden="true">↗</span>
              </button>;
            })}
          </div>

          <div className="courses-feature" key={selected.id}>
            <article className="courses-feature-main">
              <div className="courses-feature-top"><span className="courses-badge">{t("С нуля")}</span><span className="courses-feature-id">{t("courses.selectedDirection")}</span></div>
              <span className="courses-feature-glyph" aria-hidden="true">{selected.symbol}</span>
              <h3>{t(selected.title)}</h3>
              <p className="courses-feature-subtitle">{t(selected.subtitle)}</p>
              <p className="courses-feature-description">{t(selected.description)}</p>
              <div className="courses-feature-tags">{selected.tags.map((tag) => <span key={tag}>{t(tag)}</span>)}</div>
              <Link className="courses-feature-cta" href={`/courses/${selected.id}`}>{t("courses.exploreCourse")} <span aria-hidden="true">↗</span></Link>
            </article>
            <aside className="courses-syllabus">
              <div className="courses-syllabus-heading"><span className="courses-index">02 / 02</span><h3>{t("courses.whatYouLearn")}</h3></div>
              <ol>{selected.modules.map((module, index) => <li key={module}><span>0{index + 1}</span>{t(module)}</li>)}</ol>
              <Link href={`/?course=${selected.id}#consultation`} className="courses-consult">{t("Обсудить обучение")} <span aria-hidden="true">↗</span></Link>
            </aside>
          </div>
        </section>

        <aside className="courses-starter">
          <div><span className="courses-index">{t("courses.notSure")}</span><h2>{t(starter.title)}</h2><p>{t(starter.description)}</p></div>
          <Link href={`/courses/${starter.id}`}>{t("courses.exploreStarter")} <span aria-hidden="true">↗</span></Link>
        </aside>
      </div>
    </main>
  );
}
