import Landing from "./ui/landing";
import { cookies } from "next/headers";
import { localeCookieName, resolveLocale } from "./i18n/catalogs";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; direction?: string; course?: string }>;
}) {
  const query = await searchParams;
  const cookieStore = await cookies();
  const language = resolveLocale(cookieStore.get(localeCookieName)?.value, query.lang);
  return (
    <Landing
      initialCourse={query.course}
      initialLanguage={language}
      initialFilter={
        query.direction === "code" || query.direction === "start"
          ? query.direction
          : "all"
      }
    />
  );
}
