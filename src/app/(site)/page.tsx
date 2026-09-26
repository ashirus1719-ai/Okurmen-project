import Landing from "@/components/landing";
import { cookies } from "next/headers";
import { localeCookieName, resolveLocale } from "@/lib/i18n/catalogs";

export default async function Home() {
  const cookieStore = await cookies();
  const language = resolveLocale(cookieStore.get(localeCookieName)?.value);
  return (
    <Landing
      initialLanguage={language}
      showChrome={false}
    />
  );
}
