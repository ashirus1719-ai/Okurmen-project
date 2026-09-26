import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { localeCookieName, resolveLocale } from "../i18n/catalogs";
import AuthPreferences from "../ui/auth-preferences";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Вход в аккаунт — Окурмэн айти",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

  return (
    <main className="auth-layout">
      <div className="auth-topline">
        <Link href="/" className="auth-brand" aria-label="Окурмэн айти — главная">
          <Image src="/logo.png" alt="" width={40} height={40} priority />
        </Link>
        <div className="auth-topline-actions">
          <AuthPreferences initialLocale={locale} />
          <Link href="/" className="auth-back">← {locale === "en" ? "Home" : locale === "kg" ? "Башкы бет" : "На главную"}</Link>
        </div>
      </div>
      <div className="auth-main">
        <LoginForm locale={locale} googleEnabled={googleEnabled} />
      </div>
    </main>
  );
}