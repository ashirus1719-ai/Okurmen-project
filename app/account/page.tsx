import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { localeCookieName, resolveLocale } from "../i18n/catalogs";
import AuthPreferences from "../ui/auth-preferences";
import AccountActions from "./account-actions";

export const metadata: Metadata = {
  title: "Аккаунт — Окурмэн айти",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);

  return (
    <main className="account-layout">
      <header className="account-header">
        <Link href="/" className="auth-brand" aria-label="Окурмэн айти — главная">
          <Image src="/logo.png" alt="" width={40} height={40} priority />
        </Link>
        <div className="account-header-actions">
          <AuthPreferences initialLocale={locale} />
          <AccountActions locale={locale} />
        </div>
      </header>
      <section className="account-content">
        <h1>{locale === "en" ? `Hello, ${session.user.name || "student"}` : locale === "kg" ? `Кош келиңиз, ${session.user.name || "окуучу"}` : `Здравствуйте, ${session.user.name || "ученик"}`}</h1>
        <dl className="account-details">
          <div><dt>{locale === "en" ? "Email" : "Email"}</dt><dd>{session.user.email}</dd></div>
          <div><dt>{locale === "en" ? "Email status" : locale === "kg" ? "Email абалы" : "Подтверждение почты"}</dt><dd>{session.user.emailVerified ? (locale === "en" ? "Verified" : locale === "kg" ? "Ырасталган" : "Подтверждена") : (locale === "en" ? "Not verified" : locale === "kg" ? "Ырасталган эмес" : "Не подтверждена")}</dd></div>
        </dl>
        <Link href="/" className="text-button">{locale === "en" ? "Back to learning" : locale === "kg" ? "Окууга кайтуу" : "Вернуться к обучению"}<span>↗</span></Link>
      </section>
    </main>
  );
}