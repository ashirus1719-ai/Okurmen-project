import { expect, test } from "@playwright/test";

test("courses work across themes, languages, directions and screen sizes", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));

  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const locale of ["ru", "en", "kg"] as const) {
      for (const theme of ["light", "dark"] as const) {
        await page.context().addCookies([{ name: "okurmen-locale", value: locale, url: "http://localhost:3000" }]);
        await page.goto("/courses");
        await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(page.locator(".courses-direction")).toHaveCount(2);
        await page.locator(".courses-direction").nth(1).click();
        await expect(page.locator(".courses-direction").nth(1)).toHaveAttribute("aria-pressed", "true");
        await expect(page.locator(".courses-feature-main h3")).toHaveText("Backend");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${locale} ${theme} ${width}px overflow`).toBe(true);
      }
    }
  }
  expect(errors).toEqual([]);
});

test("changing language and theme keeps the selected direction", async ({ page }) => {
  await page.goto("/courses");
  await page.locator(".courses-direction").nth(1).click();
  await page.locator(".language-trigger").click();
  await page.getByRole("menuitemradio", { name: "EN" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Choose your");
  await expect(page.locator(".courses-direction").nth(1)).toHaveAttribute("aria-pressed", "true");
  await page.locator(".theme-switch").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".courses-feature-main h3")).toHaveText("Backend");
});
