import { test, expect } from "@playwright/test";

// Add every route here as you build it.
const routes = ["/"];

for (const route of routes) {
  const name = route === "/" ? "home" : route.slice(1).replaceAll("/", "_");
  test(`visual ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    // Reduced motion makes GSAP (via gsap.matchMedia) settle instantly → stable screenshots.
    await page.emulateMedia({ reducedMotion: "reduce" });
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.ok(), `HTTP failure for ${route}`).toBeTruthy();
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "Horizontal overflow").toBeTruthy();
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
    expect(errors, `Browser errors on ${route}`).toEqual([]);
  });
}
