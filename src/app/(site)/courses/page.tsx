import { cookies } from "next/headers";
import { catalogs, localeCookieName, resolveLocale } from "@/lib/i18n/catalogs";
import CoursesView from "./courses-view";

export default async function CoursesPage() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
  return <CoursesView messages={catalogs[locale]} />;
}
