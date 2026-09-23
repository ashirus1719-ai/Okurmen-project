import Link from "next/link";

export default function NotFound() {
  return <main className="section-wrap section-space course-page"><div className="eyebrow">404 / НЕМНОГО СБИЛИСЬ С ПУТИ</div><h1>Здесь пока пусто.</h1><p>Но первый шаг в IT по-прежнему ждёт на главной.</p><Link href="/" className="button">На главную <span>↗</span></Link></main>;
}
