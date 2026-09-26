"use server";

import { getPrisma } from "@/lib/prisma";

type LeadState = { status: string; message: string };

export async function submitLead(
  _previous: LeadState,
  data: FormData,
): Promise<LeadState> {
  const name = String(data.get("name") || "").trim();
  const contact = String(data.get("contact") || "").trim();
  const direction = String(data.get("direction") || "");
  const format = String(data.get("format") || "");
  const error = (message: string): LeadState => ({ status: "error", message });
  if (data.get("website")) return error("Не удалось отправить заявку.");
  if (
    name.length < 2 ||
    name.length > 80 ||
    contact.length > 120 ||
    !(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ||
      (/^\+?[\d\s()-]{7,24}$/.test(contact) &&
        contact.replace(/\D/g, "").length >= 7)
    )
  )
    return error("Укажи имя и корректный телефон или email.");
  if (data.get("consent") !== "on")
    return error("Нужно согласие на обработку заявки.");
  if (
    !["undecided", "frontend", "backend", "start", "community"].includes(
      direction,
    ) ||
    !["undecided", "offline", "hybrid", "self"].includes(format)
  )
    return error("Выбери направление и формат из списка.");
  try {
    const prisma = getPrisma();
    const normalizedContact = contact.includes("@")
      ? contact.toLowerCase()
      : contact.replace(/[^\d+]/g, "");
    const dedupeKey = `${normalizedContact}:${new Date().toISOString().slice(0, 10)}`;
    await prisma.lead.upsert({
      where: { dedupeKey },
      update: {},
      create: {
        name,
        contact: normalizedContact,
        direction,
        format,
        consentVersion: "consultation-v1",
        dedupeKey,
      },
    });
    return {
      status: "success",
      message: "Спасибо! Заявка сохранена. Свяжемся по указанному контакту.",
    };
  } catch {
    return error("Сейчас не удалось сохранить заявку. Попробуй немного позже.");
  }
}
