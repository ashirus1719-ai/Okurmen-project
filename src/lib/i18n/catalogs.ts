import en from "./en.json";
import kg from "./kg.json";
import ru from "./ru.json";

export const localeCookieName = "okurmen-locale";
export const locales = ["ru", "en", "kg"] as const;
export type Locale = (typeof locales)[number];
export type MessageCatalog = Record<string, string>;

export const catalogs: Record<Locale, MessageCatalog> = {
  ru: ru as MessageCatalog,
  en: en as MessageCatalog,
  kg: kg as MessageCatalog,
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

export function resolveLocale(value: unknown, fallback: unknown = "ru"): Locale {
  if (value === "ky") return "kg";
  if (fallback === "ky") return "kg";
  if (isLocale(value)) return value;
  if (isLocale(fallback)) return fallback;
  return "ru";
}