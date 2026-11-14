import { test, expect } from "@playwright/test";

// Add every route here as you build it.
const routes = ["/"];

for (const route of routes) {
  const name = route === "/" ? "home" : route.slice(1).replaceAll("/", "_");
  test(`visual ${route}`, async ({ page }) => {
    // Reduced motion makes GSAP (via gsap.matchMedia) settle instantly → stable screenshots.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}
