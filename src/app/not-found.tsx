import Link from "next/link";
import { cookies } from "next/headers";
import { catalogs, localeCookieName, resolveLocale } from "@/lib/i18n/catalogs";
import { localizeView } from "@/lib/i18n/localize-view";

export default async function NotFound() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
  const content = (
    <main className="section-wrap section-space course-page">
      <div className="eyebrow">404 / НЕМНОГО СБИЛИСЬ С ПУТИ</div>
      <h1>Здесь пока пусто.</h1>
      <p>Но первый шаг в IT по-прежнему ждёт на главной.</p>
      <Link href="/" className="button">На главную <span>↗</span></Link>
    </main>
  );
  return localizeView(content, catalogs[locale]);
}
