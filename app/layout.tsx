import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Окурмен айти — учись, создавай, становись разработчиком",
  description:
    "Frontend, backend и первые шаги в IT. Практика, проекты и поддержка ментора в Окурмен айти. Выбери направление и запишись на консультацию.",
  openGraph: {
    title: "Окурмен айти — твоя новая точка старта",
    description:
      "От первой строки кода до своего проекта. Обучение frontend и backend с поддержкой ментора.",
    locale: "ru_RU",
    type: "website",
  },
  icons: {
    icon: "/logo-favicon.png",
    shortcut: "/logo-favicon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
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
