import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { catalogs, localeCookieName, resolveLocale } from "@/lib/i18n/catalogs";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
  const messages = catalogs[locale];
  return {
    title: messages["__meta.title"],
    description: messages["__meta.description"],
    openGraph: {
      title: messages["__meta.ogTitle"],
      description: messages["__meta.ogDescription"],
      locale: locale === "ru" ? "ru_RU" : locale === "kg" ? "ky_KG" : "en_US",
      type: "website",
    },
    icons: {
      icon: "/logo-favicon.png",
      shortcut: "/logo-favicon.png",
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const locale = resolveLocale(cookieStore.get(localeCookieName)?.value);
  return (
    <html
      lang={locale === "kg" ? "ky" : locale}
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('okurmen-theme');document.documentElement.dataset.theme=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch(e){}})()`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
