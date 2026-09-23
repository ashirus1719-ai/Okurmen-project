import { expect, test } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { Client } from "pg";

test("responsive layout has no horizontal overflow", async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Создавай.");
    const overflow = await page.evaluate(() => Array.from(document.querySelectorAll("body *")).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.right > window.innerWidth + 1 && !el.closest(".skills-ribbon");
    }).map(el => ({ tag: el.tagName, class: el.className, right: el.getBoundingClientRect().right })));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), JSON.stringify({ width, overflow })).toBe(true);
  }
});

test("filters, course expansion, quiz, FAQ, language and theme", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "Разработка", exact: true }).click();
  await expect(page.locator(".course-card")).toHaveCount(2);
  await expect(page).toHaveURL(/direction=code/);
  await page.reload();
  await expect(page.locator(".course-card")).toHaveCount(2);
  await page.locator(".course-details summary").first().click();
  await expect(page.locator(".course-details ol").first()).toBeVisible();
  await page.locator(".quiz-options button").nth(2).click();
  await expect(page.locator(".quiz-feedback")).toContainText("Попробуй ещё");
  await page.locator(".quiz-options button").first().click();
  await expect(page.locator(".quiz-feedback")).toContainText("Получилось");
  await page.locator(".faq-list summary").first().click();
  await expect(page.locator(".faq-list details p").first()).toBeVisible();
  await page.getByRole("switch").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  await page.getByRole("button", { name: "Кыргызча" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Жарат.");
  await expect(page.locator("html")).toHaveAttribute("lang", "ky");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Жарат.");
  expect(errors).toEqual([]);
});

test("mobile navigation and server-side form validation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await page.getByRole("button", { name: "Меню", exact: true }).click();
  await expect(page.getByRole("navigation")).toBeVisible();
  await page.getByRole("navigation").getByRole("link", { name: "Курсы", exact: true }).click();
  await expect(page.getByRole("navigation")).not.toBeVisible();
  await page.getByLabel("Как тебя зовут?").fill("Тест");
  await page.getByLabel("Телефон или email").fill("not-a-contact");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Записаться на консультацию" }).click();
  await expect(page.locator(".form-status")).toContainText("корректный телефон");
  await page.screenshot({ path: "test-results/landing-mobile.png", fullPage: true });
});

test("desktop preview", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.screenshot({ path: "test-results/landing-desktop.png", fullPage: true });
  await page.screenshot({ path: "test-results/landing-hero.png" });
});

test("lead is persisted once and test data is cleaned up", async ({ page }) => {
  test.skip(process.env.TEST_NEON_WRITE !== "1", "Explicit opt-in for a temporary database record");
  loadEnvConfig(process.cwd(), true);
  const database = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15_000 });
  await database.connect();
  const contact = `landing-e2e-${randomUUID()}@example.invalid`;
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      await page.goto("/");
      await page.getByLabel("Как тебя зовут?").fill("AUTOMATED LANDING TEST");
      await page.getByLabel("Телефон или email").fill(contact);
      await page.getByRole("checkbox").check();
      await page.getByRole("button", { name: "Записаться на консультацию" }).click();
      await expect(page.locator(".form-status")).toContainText("Заявка сохранена", { timeout: 20_000 });
    }
    const result = await database.query("SELECT count(*)::int AS total FROM leads WHERE contact = $1", [contact]);
    expect(result.rows[0].total).toBe(1);
  } finally {
    try {
      await database.query("DELETE FROM leads WHERE contact = $1 AND name = $2", [contact, "AUTOMATED LANDING TEST"]);
    } finally { await database.end(); }
  }
});
