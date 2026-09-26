import type { ReactNode } from "react";
import { cookies } from "next/headers";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { localeCookieName, resolveLocale } from "@/lib/i18n/catalogs";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);

  return (
    <>
      <SiteHeader locale={locale} />
      {children}
      <SiteFooter locale={locale} />
    </>
  );
}