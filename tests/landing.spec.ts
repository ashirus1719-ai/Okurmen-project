import { expect, test } from "@playwright/test";

test("responsive layout has no horizontal overflow", async ({ page }) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Не просто");
    const overflow = await page.evaluate(() => Array.from(document.querySelectorAll("body *")).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.right > window.innerWidth + 1 && !el.closest(".skills-ribbon");
    }).map(el => ({ tag: el.tagName, class: el.className, right: el.getBoundingClientRect().right })));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), JSON.stringify({ width, overflow })).toBe(true);
  }
});

test("removed sections, navigation, language and theme", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("#courses, #approach, #formats, #playground, #community, #reviews, #faq")).toHaveCount(0);
  await expect(page.getByRole("navigation").getByRole("link", { name: "Курсы" })).toHaveAttribute("href", "/courses");
  await expect(page.getByRole("link", { name: /Начать свой путь/ })).toHaveAttribute("href", "/courses");
  await expect(page.locator('a[href*="#contacts"]')).toHaveCount(0);
  await expect(page.getByText("Адрес, часы работы и прямые контакты готовятся к публикации.")).toHaveCount(0);
  await expect(page.locator(".header .nav > .mobile-nav-only")).toBeHidden();
  await expect(page.locator(".header-login")).toBeVisible();
  await expect(page.locator(".site-footer")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await page.locator(".header .theme-switch").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".site-footer")).toHaveCSS("background-color", "rgb(45, 48, 61)");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Язык" }).click();
  await page.getByRole("menuitemradio", { name: "KG" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ky");
  await expect(page.locator(".hero-buttons .text-button")).toContainText("Программаларды көрүү");
  await expect(page.locator(".art-caption")).toHaveText("үйрөн. жарат. өзүң бол.");
  await expect(page.locator(".site-footer__brand address")).toContainText("Орозбеков көчөсү, 136");
  await expect(page.locator(".site-footer__brand h2")).toHaveText("Дарек");
  await expect(page.locator(".site-footer__contacts").locator("..").locator("h2")).toHaveText("Байланыш");
  await expect(page.locator(".site-footer__column h2").first()).toHaveText("Тез шилтемелер");
  await page.goto("/courses/frontend");
  await expect(page.getByRole("link", { name: "← Бардык багыттар" })).toBeVisible();
  await expect(page.locator(".course-page .eyebrow")).toHaveText("ОКУРМЭН АЙТИ / ОКУУ ПРОГРАММАСЫ");
  await page.goto("/");
  await page.getByRole("button", { name: "Тил" }).click();
  await page.getByRole("menuitemradio", { name: "EN" }).click();
  await expect(page.locator(".hero-buttons .text-button")).toContainText("View programs");
  await expect(page.locator(".art-caption")).toHaveText("learn. build. become.");
  await expect(page.locator(".site-footer__brand address")).toContainText("136 Orozbekova St.");
  await expect(page.locator(".site-footer__brand h2")).toHaveText("Address");
  await expect(page.locator(".site-footer__column h2").first()).toHaveText("Quick Links");
  await expect(page.locator(".site-footer__bottom > span").first()).toContainText("Okurmen IT");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(errors).toEqual([]);
});

test("home and courses reuse the shared layout without a document reload", async ({ page }) => {
  let documentLoads = 0;
  page.on("load", () => documentLoads++);
  await page.goto("/");
  await expect(page.locator(".header")).toHaveCount(1);
  await expect(page.locator(".site-footer")).toHaveCount(1);

  await page.locator(".header .nav").getByRole("link", { name: "Курсы" }).click();
  await expect(page).toHaveURL(/\/courses$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Выбери свой");
  await expect(page.locator(".header")).toHaveCount(1);
  await expect(page.locator(".site-footer")).toHaveCount(1);

  await page.locator(".header .nav").getByRole("link", { name: "Главная" }).click();
  await expect(page).toHaveURL(/\/#main$/);
  await expect(page.locator(".header")).toHaveCount(1);
  await expect(page.locator(".site-footer")).toHaveCount(1);
  expect(documentLoads).toBe(1);
});

test("restored hero illustration stays usable across sizes and themes", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".hero-art .art-caption")).toHaveText("учись. создавай. становись собой.");
  await expect(page.locator(".hero-buttons .text-button")).toHaveAttribute("href", "/courses#courses-directions-title");
  await expect(page.locator(".code-window")).toHaveCSS("background-color", "rgb(30, 30, 30)");
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `page overflows at ${width}px`).toBe(true);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator(".header .theme-switch").click();
  await expect(page.locator(".code-window")).toHaveCSS("background-color", "rgb(30, 30, 30)");
});

test("mobile navigation stays docked and opens its destinations", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const mobileNav = page.locator(".header .nav");
  await expect(mobileNav).toHaveCSS("position", "fixed");
  await expect(mobileNav).toHaveCSS("display", "grid");
  await expect(mobileNav.getByRole("link")).toHaveCount(3);
  await expect(mobileNav.locator(".mobile-nav-only")).toBeVisible();
  await mobileNav.getByRole("link", { name: "Войти" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/");
  await page.locator(".header .nav").getByRole("link", { name: "Курсы" }).click();
  await expect(page).toHaveURL(/\/courses$/);
});

test("mobile footer back-to-top button", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.locator(".header .brand-sub")).toHaveText("ИТ-школа");
  await expect(page.locator("#consultation")).toHaveCount(0);
  await expect(page.locator(".site-footer")).toHaveCSS("border-top-width", "1px");
  await expect(page.locator(".site-footer")).toHaveCSS("border-top-color", "rgb(65, 105, 225)");
  await expect(page.locator(".site-footer__column h2").first()).toHaveCSS("font-size", "16px");
  await expect(page.locator(".site-footer__column h3").first()).toHaveCSS("font-size", "15px");
  await expect(page.locator(".site-footer__column li").first()).toHaveCSS("font-size", "14px");
  await expect(page.locator(".header .nav")).toHaveCSS("box-shadow", "none");
  const backTop = page.locator(".back-top");
  await expect(backTop).toHaveAttribute("href", "#");
  await expect(backTop).toHaveCSS("box-shadow", "none");
  const before = await backTop.boundingBox();
  await backTop.hover();
  await expect(backTop).toHaveCSS("width", "140px");
  const after = await backTop.boundingBox();
  expect(before && after && Math.abs(before.x + before.width / 2 - after.x - after.width / 2)).toBeLessThan(1);
  await expect(backTop.locator(".back-top-label")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
  await backTop.click();
  await expect(page).toHaveURL(/#$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.screenshot({ path: "test-results/landing-mobile.png", fullPage: true });
});

test("footer contacts remain readable at mobile and desktop widths", async ({ page }) => {
  await page.goto("/");
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const footer = await page.locator(".site-footer").evaluate((element) => {
      const phones = [...element.querySelectorAll<HTMLElement>(".site-footer__contacts a")];
      return {
        overflowing: element.scrollWidth > element.clientWidth,
        wrappedPhones: phones.filter((phone) =>
          phone.getBoundingClientRect().height > parseFloat(getComputedStyle(phone).lineHeight) + 1,
        ).map((phone) => phone.textContent),
      };
    });
    expect(footer, `footer at ${width}px`).toEqual({ overflowing: false, wrappedPhones: [] });
  }
  await page.evaluate(() => { document.documentElement.dataset.theme = "dark"; });
  const headingColors = await page.locator(".site-footer").evaluate((element) =>
    [...element.querySelectorAll("h2, h3")].map((heading) => getComputedStyle(heading).color),
  );
  expect(new Set(headingColors).size).toBe(1);
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
  await page.getByRole("link", { name: "Okurmen IT — home" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".language-trigger")).toHaveText("EN");
  await expect(page.locator(".header .brand-sub")).toHaveText("IT school");
  await expect(page.locator(".project-preview")).toHaveCSS("background-color", "rgb(255, 254, 249)");
  await expect(page.locator(".lead-form")).toHaveCount(0);
});

test("desktop preview", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.screenshot({ path: "test-results/landing-desktop.png", fullPage: true });
  await page.screenshot({ path: "test-results/landing-hero.png" });
});

test("draft is accessible directly and absent from public navigation", async ({ page }) => {
  for (const path of ["/courses", "/courses/frontend"]) {
    await page.goto(path);
    await expect(page.locator('a[href*="#contacts"]')).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Обсудить обучение" })).toHaveCount(0);
    await expect(page.locator('a[href="/draft"]')).toHaveCount(0);
  }
  await page.goto("/");
  await expect(page.locator('a[href="/draft"]')).toHaveCount(0);
  const response = await page.goto("/draft");
  expect(response?.status()).toBe(200);
});
