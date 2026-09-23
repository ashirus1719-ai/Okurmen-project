import { notFound } from "next/navigation";
import Link from "next/link";
import { courses } from "@/lib/courses";
import type { Metadata } from "next";

export function generateStaticParams() {
  return courses.map(course => ({ slug: course.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = courses.find(item => item.id === slug);
  return { title: course ? `${course.title} — Окурмен айти` : "Курс не найден", description: course?.description };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = courses.find(item => item.id === slug);
  if (!course) notFound();
  return <main className="section-wrap section-space course-page">
    <Link href="/#courses" className="text-button">← Все направления</Link>
    <div className="course-page-grid">
      <div><div className="eyebrow">ОКУРМЕН АЙТИ / ПРОГРАММА ОБУЧЕНИЯ</div><h1>{course.title}</h1><h2>{course.subtitle}</h2><p>{course.description}</p><div className="course-tags">{course.tags.map(tag => <span key={tag}>{tag}</span>)}</div><Link href={`/?course=${course.id}#consultation`} className="button">Обсудить обучение <span>↗</span></Link></div>
      <div className={`course-card ${course.color}`}><div className="course-symbol" aria-hidden="true">{course.symbol}</div><h3>Что будем изучать</h3><ol className="course-modules">{course.modules.map(module => <li key={module}>{module}</li>)}</ol></div>
    </div>
    <section className="enrollment-banner"><div><h3>Сначала — понятные условия</h3><p>Программа предварительная: содержание и итоговый проект уточняются для выбранной группы. На консультации согласуем уровень, формат, даты, расписание и полную стоимость. Оставленная заявка не резервирует место и не обязывает к оплате.</p></div></section>
  </main>;
}
