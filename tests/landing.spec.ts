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
  await expect(page.locator(".header .brand-sub")).toHaveText("ИТ-школа");
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

test("login screen switches between sign-up and password recovery", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const languageWidth = await page.locator(".language-control").evaluate((element) => parseFloat(getComputedStyle(element).width));
  expect(languageWidth).toBeLessThanOrEqual(48);
  await expect(page.getByRole("link", { name: "Войти", exact: true })).toHaveAttribute("href", "/login");
  await page.getByRole("link", { name: "Войти", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.locator(".auth-panel-heading h2")).toHaveText("Вход");
  await expect(page.locator(".auth-icon-filled")).toHaveCount(2);
  await expect(page.locator(".auth-eye-icon")).toHaveCount(1);
  const themeInput = page.locator(".auth-preferences .theme-switch__checkbox");
  if (await themeInput.isChecked()) {
    await page.locator(".auth-preferences .theme-switch").click();
  }
  await expect(page.locator(".auth-layout")).toHaveCSS("background-color", "rgb(244, 246, 249)");
  await expect(page.locator(".auth-panel")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(page.locator(".auth-submit")).toHaveCSS("background-color", "rgb(65, 105, 225)");
  const password = page.locator('input[autocomplete="current-password"]');
  await page.getByRole("button", { name: "Показать пароль" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Скрыть пароль" }).click();
  await expect(password).toHaveAttribute("type", "password");

  await page.getByRole("button", { name: "Зарегистрироваться" }).click();
  await expect(page.getByRole("textbox", { name: "Имя" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Повторите пароль" })).toBeVisible();

  await page.getByRole("button", { name: "Вернуться ко входу" }).click();
  await page.getByRole("button", { name: "Забыли пароль?" }).click();
  await expect(page.getByRole("heading", { name: "Восстановление пароля" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  await page.getByRole("button", { name: "Вернуться ко входу" }).click();
  if (!(await themeInput.isChecked())) {
    await page.locator(".auth-preferences .theme-switch").click();
  }
  await expect(page.locator(".auth-layout")).toHaveCSS("background-color", "rgb(16, 23, 32)");
  await expect(page.locator(".auth-panel")).toHaveCSS("background-color", "rgb(27, 37, 49)");
  await expect(page.locator(".auth-panel")).toHaveCSS("border-top-width", "0px");
  await expect(page.locator(".auth-field input").first()).toHaveCSS("background-color", "rgb(35, 47, 61)");
  await expect(page.locator(".auth-field input").first()).toHaveCSS("color", "rgb(240, 243, 248)");
  await page.getByRole("button", { name: "Язык" }).click();
  await page.getByRole("menuitemradio", { name: "EN" }).click();
  await expect(page.locator(".auth-panel-heading h2")).toHaveText("Sign in");
  await page.getByRole("link", { name: "Окурмэн айти — главная" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".language-trigger")).toHaveText("EN");
  await expect(page.locator(".header .brand-sub")).toHaveText("IT school");
  await expect(page.locator(".project-preview")).toHaveCSS("background-color", "rgb(8, 12, 18)");
  const leadInputs = page.locator('.lead-form input:not([type="hidden"]):not([type="checkbox"])');
  await expect(leadInputs).toHaveCount(3);
  await expect(leadInputs.first()).toHaveCSS("background-color", "rgb(35, 47, 61)");
  await expect(leadInputs.first()).toHaveCSS("color", "rgb(240, 243, 248)");
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
