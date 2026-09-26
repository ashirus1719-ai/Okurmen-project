import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { courses } from "@/lib/courses";
import type { Metadata } from "next";
import { catalogs, localeCookieName, resolveLocale } from "@/lib/i18n/catalogs";
import { localizeView } from "@/lib/i18n/localize-view";

export function generateStaticParams() {
  return courses.map(course => ({ slug: course.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = courses.find(item => item.id === slug);
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
  const messages = catalogs[locale];
  return {
    title: course
      ? `${messages[course.title] ?? course.title} — ${locale === "en" ? "Okurmen IT" : "Окурмэн айти"}`
      : messages["__meta.courseNotFound"],
    description: course ? messages[course.description] ?? course.description : undefined,
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courses.find(item => item.id === slug);
  if (!course) notFound();
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
  const content = (
    <main className="section-wrap section-space course-page" id="main">
      <Link href="/courses" className="text-button">← Все направления</Link>
      <div className="course-page-grid">
        <div>
          <div className="eyebrow">ОКУРМЭН АЙТИ / ПРОГРАММА ОБУЧЕНИЯ</div>
          <h1>{course.title}</h1>
          <h2>{course.subtitle}</h2>
          <p>{course.description}</p>
          <div className="course-tags">
            {course.tags.map(tag => <span key={tag}>{tag}</span>)}
          </div>
        </div>
        <div className={`course-card ${course.color}`}>
          <div className="course-symbol" aria-hidden="true">{course.symbol}</div>
          <h3>Что будем изучать</h3>
          <ol className="course-modules">
            {course.modules.map(module => <li key={module}>{module}</li>)}
          </ol>
        </div>
      </div>
    </main>
  );
  return localizeView(content, catalogs[locale]);
}
