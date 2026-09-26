import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { catalogs, localeCookieName, resolveLocale } from "@/lib/i18n/catalogs";
import AuthPreferences from "@/components/auth-preferences";
import LoginForm from "./login-form";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
  return {
    title: catalogs[locale]["__meta.loginTitle"],
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage() {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
  const messages = catalogs[locale];
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const emailEnabled = Boolean(process.env.RESEND_API_KEY && process.env.AUTH_EMAIL_FROM);

  return (
    <main className="auth-layout">
      <div className="auth-topline">
        <Link href="/" className="auth-brand" aria-label={messages["Окурмэн айти — главная"]}>
          <Image src="/logo.png" alt="" width={40} height={40} priority />
        </Link>
        <div className="auth-topline-actions">
          <AuthPreferences initialLocale={locale} />
          <Link href="/" className="auth-back">← {locale === "en" ? "Home" : locale === "kg" ? "Башкы бет" : "На главную"}</Link>
        </div>
      </div>
      <div className="auth-main">
        <LoginForm locale={locale} googleEnabled={googleEnabled} emailEnabled={emailEnabled} />
      </div>
    </main>
  );
}
